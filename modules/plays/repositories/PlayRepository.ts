import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { PlayQueryParams, PlayWithRelations } from '../types'

export class PlayRepository {
  
  async findById(id: string, includeRelations = true) {
    return await prisma.play.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: true,
        ...(includeRelations && {
          relationsFrom: {
            include: {
              relatedPlay: {
                select: { id: true, title: true }
              }
            }
          },
          relationsTo: {
            include: {
              play: {
                select: { id: true, title: true }
              }
            }
          },
        }),
      },
    })
  }

  async findByShareToken(token: string) {
    return await prisma.play.findUnique({
      where: { shareToken: token },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: true,
        relationsFrom: {
          include: {
            relatedPlay: {
              select: { id: true, title: true }
            }
          }
        },
        relationsTo: {
          include: {
            play: {
              select: { id: true, title: true }
            }
          }
        },
      },
    })
  }

  async findMany(params: PlayQueryParams = {}) {
    const {
      authorId,
      tags = [],
      search,
      category,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeRelations = false
    } = params

    const where: Prisma.PlayWhereInput = {
      ...(authorId && { authorId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(tags.length > 0 && {
        tags: {
          some: {
            id: { in: tags }
          }
        }
      }),
      ...(category && {
        tags: {
          some: { category }
        }
      }),
    }

    const [plays, total] = await Promise.all([
      prisma.play.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          tags: true,
          ...(includeRelations && {
            relationsFrom: {
              include: {
                relatedPlay: {
                  select: { id: true, title: true }
                }
              }
            },
            relationsTo: {
              include: {
                play: {
                  select: { id: true, title: true }
                }
              }
            },
          }),
          _count: {
            select: {
              relationsFrom: true,
              relationsTo: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.play.count({ where })
    ])

    return { plays, total }
  }

  async create(data: Prisma.PlayCreateInput) {
    return await prisma.play.create({
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: true,
        relationsFrom: {
          include: {
            relatedPlay: {
              select: { id: true, title: true }
            }
          }
        },
        relationsTo: {
          include: {
            play: {
              select: { id: true, title: true }
            }
          }
        },
      },
    })
  }

  async update(id: string, data: Prisma.PlayUpdateInput) {
    return await prisma.play.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: true,
        relationsFrom: {
          include: {
            relatedPlay: {
              select: { id: true, title: true }
            }
          }
        },
        relationsTo: {
          include: {
            play: {
              select: { id: true, title: true }
            }
          }
        },
      },
    })
  }

  async delete(id: string) {
    return await prisma.play.delete({ where: { id } })
  }

  async findByAuthor(authorId: string, limit = 10) {
    return await prisma.play.findMany({
      where: { authorId },
      include: {
        tags: true,
        _count: {
          select: {
            relationsFrom: true,
            relationsTo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async findRelated(playId: string) {
    return await prisma.playRelation.findMany({
      where: {
        OR: [
          { playId },
          { relatedPlayId: playId }
        ]
      },
      include: {
        play: {
          select: { id: true, title: true, tags: true }
        },
        relatedPlay: {
          select: { id: true, title: true, tags: true }
        }
      }
    })
  }

  async countByTag(tagId: string) {
    return await prisma.play.count({
      where: {
        tags: {
          some: { id: tagId }
        }
      }
    })
  }

  async findPopular(limit = 10) {
    // Find plays with most relations (considered popular)
    return await prisma.play.findMany({
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        tags: true,
        _count: {
          select: {
            relationsFrom: true,
            relationsTo: true
          }
        }
      },
      orderBy: [
        {
          relationsFrom: {
            _count: 'desc'
          }
        },
        {
          relationsTo: {
            _count: 'desc'
          }
        }
      ],
      take: limit,
    })
  }

  async searchByTitle(query: string, limit = 5) {
    return await prisma.play.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
      take: limit,
    })
  }

  async bulkUpdateTags(playIds: string[], tagIds: string[]) {
    return await prisma.$transaction(
      playIds.map(playId =>
        prisma.play.update({
          where: { id: playId },
          data: {
            tags: {
              set: tagIds.map(id => ({ id }))
            }
          }
        })
      )
    )
  }

  async getStatistics() {
    const [
      totalPlays,
      playsThisMonth,
      playsByTag,
      averageActions
    ] = await Promise.all([
      prisma.play.count(),
      prisma.play.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.playTag.findMany({
        include: {
          _count: {
            select: { plays: true }
          }
        },
        orderBy: {
          plays: { _count: 'desc' }
        },
        take: 10
      }),
      prisma.play.findMany({
        select: { diagramJSON: true }
      }).then(plays => {
        const totalActions = plays.reduce((sum, play) => {
          const diagram = play.diagramJSON as any
          return sum + (diagram?.actions?.length || 0)
        }, 0)
        return Math.round(totalActions / plays.length) || 0
      })
    ])

    return {
      totalPlays,
      playsThisMonth,
      playsByTag,
      averageActions
    }
  }
}