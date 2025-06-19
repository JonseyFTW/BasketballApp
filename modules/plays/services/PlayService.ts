import { prisma } from '@/lib/db'
import { 
  PlayWithRelations, 
  CreatePlayDto, 
  UpdatePlayDto, 
  PlayQueryParams,
  AdaptPlayRequest,
  AdaptedPlay,
  PlayStats,
  CreatePlayRelationDto,
  PlayerMapping,
  PlayValidationResult
} from '../types'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleServiceError,
  validatePlayTitle,
  validatePlayDiagram,
  generateShareToken,
  calculateDistance,
  adjustSpacingForSpeed,
  calculatePlayComplexity,
  AppError
} from '../../common/utils'
import { PlayDiagram, PlayerAttributes } from '../../common/types'
import { Prisma, TagCategory, RelationType } from '@prisma/client'

export class PlayService {
  
  async createPlay(dto: CreatePlayDto, authorId: string): Promise<PlayWithRelations> {
    try {
      // Validate input
      const titleValidation = validatePlayTitle(dto.title)
      if (!titleValidation.isValid) {
        throw new AppError(titleValidation.errors.join(', '), 400)
      }

      const diagramValidation = validatePlayDiagram(dto.diagramJSON)
      if (!diagramValidation.isValid) {
        throw new AppError(diagramValidation.errors.join(', '), 400)
      }

      // Create play with tags
      const play = await prisma.play.create({
        data: {
          title: dto.title,
          description: dto.description,
          diagramJSON: dto.diagramJSON as Prisma.JsonObject,
          authorId,
          tags: dto.tagIds ? {
            connect: dto.tagIds.map(id => ({ id }))
          } : undefined,
        },
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

      return play as PlayWithRelations
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getPlayById(id: string, includeRelations = true): Promise<PlayWithRelations | null> {
    try {
      const play = await prisma.play.findUnique({
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

      return play as PlayWithRelations | null
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getPlays(params: PlayQueryParams = {}) {
    try {
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

      // Build where clause
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

      // Get total count
      const total = await prisma.play.count({ where })

      // Get plays
      const plays = await prisma.play.findMany({
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
      })

      return {
        plays: plays as PlayWithRelations[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async updatePlay(id: string, dto: UpdatePlayDto, userId: string): Promise<PlayWithRelations> {
    try {
      // Check if play exists and user has permission
      const existingPlay = await prisma.play.findUnique({
        where: { id },
        select: { authorId: true }
      })

      if (!existingPlay) {
        throw new AppError('Play not found', 404)
      }

      if (existingPlay.authorId !== userId) {
        throw new AppError('Not authorized to update this play', 403)
      }

      // Validate updates
      if (dto.title) {
        const titleValidation = validatePlayTitle(dto.title)
        if (!titleValidation.isValid) {
          throw new AppError(titleValidation.errors.join(', '), 400)
        }
      }

      if (dto.diagramJSON) {
        const diagramValidation = validatePlayDiagram(dto.diagramJSON)
        if (!diagramValidation.isValid) {
          throw new AppError(diagramValidation.errors.join(', '), 400)
        }
      }

      // Update play
      const updatedPlay = await prisma.play.update({
        where: { id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.diagramJSON && { diagramJSON: dto.diagramJSON as Prisma.JsonObject }),
          ...(dto.tagIds && {
            tags: {
              set: dto.tagIds.map(tagId => ({ id: tagId }))
            }
          }),
        },
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

      return updatedPlay as PlayWithRelations
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async deletePlay(id: string, userId: string): Promise<void> {
    try {
      // Check if play exists and user has permission
      const existingPlay = await prisma.play.findUnique({
        where: { id },
        select: { authorId: true }
      })

      if (!existingPlay) {
        throw new AppError('Play not found', 404)
      }

      if (existingPlay.authorId !== userId) {
        throw new AppError('Not authorized to delete this play', 403)
      }

      await prisma.play.delete({
        where: { id }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async adaptPlayForPlayers(request: AdaptPlayRequest): Promise<AdaptedPlay> {
    try {
      const play = await this.getPlayById(request.playId, false)
      if (!play) {
        throw new AppError('Play not found', 404)
      }

      const originalDiagram = play.diagramJSON as PlayDiagram
      const adaptedDiagram = { ...originalDiagram }
      const adaptationNotes: string[] = []

      // Get player profiles for mappings
      const playerIds = request.playerMappings.map(m => m.actualPlayerId)
      const playerProfiles = await prisma.playerProfile.findMany({
        where: { id: { in: playerIds } }
      })

      // Create player lookup
      const playerLookup = new Map(
        playerProfiles.map(p => [p.id, p])
      )

      // Adapt each player's position and related actions
      for (const mapping of request.playerMappings) {
        const playerProfile = playerLookup.get(mapping.actualPlayerId)
        if (!playerProfile) continue

        const attributes = playerProfile.attributes as PlayerAttributes
        const diagramPlayer = adaptedDiagram.players.find(
          p => p.id === mapping.diagramPlayerId
        )

        if (!diagramPlayer) continue

        // Adjust movements based on player speed
        const playerActions = adaptedDiagram.actions.filter(
          action => action.from.playerId === mapping.diagramPlayerId
        )

        for (const action of playerActions) {
          if (action.type === 'cut' && action.to.x !== undefined && action.to.y !== undefined) {
            const originalDistance = calculateDistance(
              { x: diagramPlayer.x, y: diagramPlayer.y },
              { x: action.to.x, y: action.to.y }
            )

            const adjustedDistance = adjustSpacingForSpeed(originalDistance, attributes.speed)
            
            if (Math.abs(adjustedDistance - originalDistance) > 20) {
              // Significant adjustment needed
              const ratio = adjustedDistance / originalDistance
              const newX = diagramPlayer.x + (action.to.x - diagramPlayer.x) * ratio
              const newY = diagramPlayer.y + (action.to.y - diagramPlayer.y) * ratio

              action.to.x = Math.max(0, Math.min(800, newX))
              action.to.y = Math.max(0, Math.min(600, newY))

              adaptationNotes.push(
                `Adjusted ${playerProfile.name}'s movement distance by ${Math.round((ratio - 1) * 100)}% due to speed attribute`
              )
            }
          }
        }

        // Position adjustments based on player size for screens
        if (attributes.size < 60) {
          const screenActions = adaptedDiagram.actions.filter(
            action => action.type === 'screen' && action.from.playerId === mapping.diagramPlayerId
          )
          
          if (screenActions.length > 0) {
            adaptationNotes.push(
              `${playerProfile.name} may struggle with screens due to smaller size (${attributes.size}/100)`
            )
          }
        }
      }

      return {
        originalDiagram,
        adaptedDiagram,
        adaptationNotes,
        playerMappings: request.playerMappings,
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async createPlayRelation(dto: CreatePlayRelationDto): Promise<void> {
    try {
      // Validate both plays exist
      const [play, relatedPlay] = await Promise.all([
        prisma.play.findUnique({ where: { id: dto.playId } }),
        prisma.play.findUnique({ where: { id: dto.relatedPlayId } })
      ])

      if (!play || !relatedPlay) {
        throw new AppError('One or both plays not found', 404)
      }

      if (dto.playId === dto.relatedPlayId) {
        throw new AppError('Cannot create relation to the same play', 400)
      }

      // Check if relation already exists
      const existingRelation = await prisma.playRelation.findUnique({
        where: {
          playId_relatedPlayId_relationType: {
            playId: dto.playId,
            relatedPlayId: dto.relatedPlayId,
            relationType: dto.relationType,
          }
        }
      })

      if (existingRelation) {
        throw new AppError('This relation already exists', 400)
      }

      await prisma.playRelation.create({
        data: dto
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async deletePlayRelation(id: string): Promise<void> {
    try {
      await prisma.playRelation.delete({
        where: { id }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async generateShareToken(playId: string, userId: string): Promise<string> {
    try {
      // Verify user owns the play
      const play = await prisma.play.findUnique({
        where: { id: playId },
        select: { authorId: true }
      })

      if (!play) {
        throw new AppError('Play not found', 404)
      }

      if (play.authorId !== userId) {
        throw new AppError('Not authorized to share this play', 403)
      }

      const shareToken = generateShareToken()
      
      await prisma.play.update({
        where: { id: playId },
        data: { shareToken }
      })

      return shareToken
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getPlayByShareToken(token: string): Promise<PlayWithRelations | null> {
    try {
      const play = await prisma.play.findUnique({
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

      return play as PlayWithRelations | null
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getPlayStats(authorId?: string): Promise<PlayStats> {
    try {
      const where = authorId ? { authorId } : {}

      const [totalPlays, playTags, playAuthors] = await Promise.all([
        prisma.play.count({ where }),
        prisma.play.findMany({
          where,
          include: { tags: true }
        }),
        prisma.play.groupBy({
          by: ['authorId'],
          _count: { id: true },
          where,
        })
      ])

      // Calculate stats
      const playsByTag: Record<string, number> = {}
      let totalComplexity = 0

      playTags.forEach(play => {
        play.tags.forEach(tag => {
          playsByTag[tag.name] = (playsByTag[tag.name] || 0) + 1
        })
        
        const complexity = calculatePlayComplexity(play.diagramJSON as PlayDiagram)
        totalComplexity += complexity
      })

      const playsByAuthor: Record<string, number> = {}
      playAuthors.forEach(author => {
        playsByAuthor[author.authorId] = author._count.id
      })

      const mostUsedTags = await prisma.playTag.findMany({
        include: {
          _count: {
            select: { plays: true }
          }
        },
        orderBy: {
          plays: { _count: 'desc' }
        },
        take: 10
      })

      return {
        totalPlays,
        playsByTag,
        playsByAuthor,
        averageComplexity: totalPlays > 0 ? Math.round(totalComplexity / totalPlays) : 0,
        mostUsedTags: mostUsedTags.map(tag => ({
          tag,
          count: tag._count.plays
        }))
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async validatePlay(playData: CreatePlayDto | UpdatePlayDto): Promise<PlayValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Title validation
    if ('title' in playData && playData.title) {
      const titleValidation = validatePlayTitle(playData.title)
      if (!titleValidation.isValid) {
        errors.push(...titleValidation.errors)
      }
    }

    // Diagram validation
    if (playData.diagramJSON) {
      const diagramValidation = validatePlayDiagram(playData.diagramJSON)
      if (!diagramValidation.isValid) {
        errors.push(...diagramValidation.errors)
      }

      // Additional warnings
      const complexity = calculatePlayComplexity(playData.diagramJSON)
      if (complexity > 80) {
        warnings.push('This play has high complexity and may be difficult to execute')
      }

      if (playData.diagramJSON.players.length < 3) {
        warnings.push('Consider adding more players for a complete play design')
      }

      if (playData.diagramJSON.actions.length === 0) {
        warnings.push('No actions defined - consider adding movements or passes')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }
}