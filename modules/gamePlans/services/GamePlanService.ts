import { prisma } from '@/lib/db'
import {
  GamePlanWithRelations,
  CreateGamePlanDto,
  UpdateGamePlanDto,
  GamePlanQueryParams,
  AddPlayToGamePlanDto,
  UpdateGamePlanItemDto,
  CreateGamePlanSequenceDto,
  GamePlanFlowChart,
  FlowNode,
  FlowEdge,
  OrganizedGamePlan,
  GamePlanStats,
  GamePlanAnalysis,
  COMMON_GAME_PLAN_SECTIONS
} from '../types'
import {
  createSuccessResponse,
  createErrorResponse,
  handleServiceError,
  generateShareToken,
  AppError
} from '../../common/utils'
import { Prisma } from '@prisma/client'

export class GamePlanService {

  async createGamePlan(dto: CreateGamePlanDto, createdById: string): Promise<GamePlanWithRelations> {
    try {
      // Validate input
      if (!dto.title || dto.title.trim().length === 0) {
        throw new AppError('Game plan title is required', 400)
      }

      if (dto.title.length > 100) {
        throw new AppError('Game plan title must be less than 100 characters', 400)
      }

      const gamePlan = await prisma.gamePlan.create({
        data: {
          title: dto.title,
          description: dto.description,
          opponent: dto.opponent,
          gameDate: dto.gameDate,
          defenseType: dto.defenseType,
          createdById,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              play: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  diagramJSON: true,
                  tags: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      color: true
                    }
                  }
                }
              }
            },
            orderBy: { orderIndex: 'asc' }
          },
          sequences: true,
        },
      })

      return gamePlan as GamePlanWithRelations
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getGamePlanById(id: string, includeDetails = true): Promise<GamePlanWithRelations | null> {
    try {
      const gamePlan = await prisma.gamePlan.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          ...(includeDetails && {
            items: {
              include: {
                play: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    diagramJSON: true,
                    tags: {
                      select: {
                        id: true,
                        name: true,
                        category: true,
                        color: true
                      }
                    }
                  }
                }
              },
              orderBy: { orderIndex: 'asc' }
            },
            sequences: true,
          }),
          _count: {
            select: {
              items: true,
              sequences: true
            }
          }
        },
      })

      return gamePlan as GamePlanWithRelations | null
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getGamePlans(params: GamePlanQueryParams = {}) {
    try {
      const {
        createdById,
        opponent,
        defenseType,
        search,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeItems = false,
        includeSequences = false
      } = params

      // Build where clause
      const where: Prisma.GamePlanWhereInput = {
        ...(createdById && { createdById }),
        ...(opponent && { opponent: { contains: opponent, mode: 'insensitive' } }),
        ...(defenseType && { defenseType }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { opponent: { contains: search, mode: 'insensitive' } }
          ]
        }),
      }

      // Get total count
      const total = await prisma.gamePlan.count({ where })

      // Get game plans
      const gamePlans = await prisma.gamePlan.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          ...(includeItems && {
            items: {
              include: {
                play: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    diagramJSON: true,
                    tags: {
                      select: {
                        id: true,
                        name: true,
                        category: true,
                        color: true
                      }
                    }
                  }
                }
              },
              orderBy: { orderIndex: 'asc' }
            },
          }),
          ...(includeSequences && {
            sequences: true,
          }),
          _count: {
            select: {
              items: true,
              sequences: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      })

      return {
        gamePlans: gamePlans as GamePlanWithRelations[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async updateGamePlan(id: string, dto: UpdateGamePlanDto, userId: string): Promise<GamePlanWithRelations> {
    try {
      // Check if game plan exists and user has permission
      const existingGamePlan = await prisma.gamePlan.findUnique({
        where: { id },
        select: { createdById: true }
      })

      if (!existingGamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      if (existingGamePlan.createdById !== userId) {
        throw new AppError('Not authorized to update this game plan', 403)
      }

      // Validate updates
      if (dto.title && dto.title.length > 100) {
        throw new AppError('Game plan title must be less than 100 characters', 400)
      }

      const updatedGamePlan = await prisma.gamePlan.update({
        where: { id },
        data: {
          ...(dto.title && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.opponent !== undefined && { opponent: dto.opponent }),
          ...(dto.gameDate !== undefined && { gameDate: dto.gameDate }),
          ...(dto.defenseType !== undefined && { defenseType: dto.defenseType }),
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              play: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  diagramJSON: true,
                  tags: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      color: true
                    }
                  }
                }
              }
            },
            orderBy: { orderIndex: 'asc' }
          },
          sequences: true,
        },
      })

      return updatedGamePlan as GamePlanWithRelations
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async deleteGamePlan(id: string, userId: string): Promise<void> {
    try {
      // Check if game plan exists and user has permission
      const existingGamePlan = await prisma.gamePlan.findUnique({
        where: { id },
        select: { createdById: true }
      })

      if (!existingGamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      if (existingGamePlan.createdById !== userId) {
        throw new AppError('Not authorized to delete this game plan', 403)
      }

      await prisma.gamePlan.delete({
        where: { id }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async addPlayToGamePlan(gamePlanId: string, dto: AddPlayToGamePlanDto, userId: string): Promise<void> {
    try {
      // Verify game plan exists and user has permission
      const gamePlan = await prisma.gamePlan.findUnique({
        where: { id: gamePlanId },
        select: { createdById: true }
      })

      if (!gamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      if (gamePlan.createdById !== userId) {
        throw new AppError('Not authorized to modify this game plan', 403)
      }

      // Verify play exists
      const play = await prisma.play.findUnique({
        where: { id: dto.playId },
        select: { id: true }
      })

      if (!play) {
        throw new AppError('Play not found', 404)
      }

      // Check if play is already in game plan
      const existingItem = await prisma.gamePlanItem.findUnique({
        where: {
          gamePlanId_playId: {
            gamePlanId,
            playId: dto.playId
          }
        }
      })

      if (existingItem) {
        throw new AppError('Play is already in this game plan', 400)
      }

      // Get next order index if not specified
      let orderIndex = dto.orderIndex
      if (orderIndex === undefined) {
        const lastItem = await prisma.gamePlanItem.findFirst({
          where: { gamePlanId },
          orderBy: { orderIndex: 'desc' }
        })
        orderIndex = (lastItem?.orderIndex || 0) + 1
      }

      await prisma.gamePlanItem.create({
        data: {
          gamePlanId,
          playId: dto.playId,
          section: dto.section,
          notes: dto.notes,
          orderIndex,
        }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async removePlayFromGamePlan(gamePlanId: string, playId: string, userId: string): Promise<void> {
    try {
      // Verify game plan exists and user has permission
      const gamePlan = await prisma.gamePlan.findUnique({
        where: { id: gamePlanId },
        select: { createdById: true }
      })

      if (!gamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      if (gamePlan.createdById !== userId) {
        throw new AppError('Not authorized to modify this game plan', 403)
      }

      const item = await prisma.gamePlanItem.findUnique({
        where: {
          gamePlanId_playId: {
            gamePlanId,
            playId
          }
        }
      })

      if (!item) {
        throw new AppError('Play not found in game plan', 404)
      }

      await prisma.gamePlanItem.delete({
        where: { id: item.id }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async updateGamePlanItem(itemId: string, dto: UpdateGamePlanItemDto, userId: string): Promise<void> {
    try {
      // Verify item exists and user has permission
      const item = await prisma.gamePlanItem.findUnique({
        where: { id: itemId },
        include: {
          gamePlan: {
            select: { createdById: true }
          }
        }
      })

      if (!item) {
        throw new AppError('Game plan item not found', 404)
      }

      if (item.gamePlan.createdById !== userId) {
        throw new AppError('Not authorized to modify this game plan', 403)
      }

      await prisma.gamePlanItem.update({
        where: { id: itemId },
        data: {
          ...(dto.section !== undefined && { section: dto.section }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.orderIndex !== undefined && { orderIndex: dto.orderIndex }),
        }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async createGamePlanSequence(gamePlanId: string, dto: CreateGamePlanSequenceDto, userId: string): Promise<void> {
    try {
      // Verify game plan exists and user has permission
      const gamePlan = await prisma.gamePlan.findUnique({
        where: { id: gamePlanId },
        select: { createdById: true }
      })

      if (!gamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      if (gamePlan.createdById !== userId) {
        throw new AppError('Not authorized to modify this game plan', 403)
      }

      // Verify both plays exist in the game plan
      const [fromPlay, toPlay] = await Promise.all([
        prisma.gamePlanItem.findUnique({
          where: {
            gamePlanId_playId: {
              gamePlanId,
              playId: dto.fromPlayId
            }
          }
        }),
        prisma.gamePlanItem.findUnique({
          where: {
            gamePlanId_playId: {
              gamePlanId,
              playId: dto.toPlayId
            }
          }
        })
      ])

      if (!fromPlay || !toPlay) {
        throw new AppError('One or both plays are not in this game plan', 400)
      }

      // Check if sequence already exists
      const existingSequence = await prisma.gamePlanSequence.findUnique({
        where: {
          gamePlanId_fromPlayId_toPlayId: {
            gamePlanId,
            fromPlayId: dto.fromPlayId,
            toPlayId: dto.toPlayId
          }
        }
      })

      if (existingSequence) {
        throw new AppError('This sequence already exists', 400)
      }

      await prisma.gamePlanSequence.create({
        data: {
          gamePlanId,
          fromPlayId: dto.fromPlayId,
          toPlayId: dto.toPlayId,
          condition: dto.condition,
          label: dto.label,
        }
      })
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getGamePlanFlowChart(gamePlanId: string): Promise<GamePlanFlowChart> {
    try {
      const gamePlan = await prisma.gamePlan.findUnique({
        where: { id: gamePlanId },
        include: {
          items: {
            include: {
              play: {
                select: {
                  id: true,
                  title: true,
                  tags: {
                    select: { name: true }
                  }
                }
              }
            },
            orderBy: { orderIndex: 'asc' }
          },
          sequences: true,
        }
      })

      if (!gamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      // Create nodes for each play
      const nodes: FlowNode[] = gamePlan.items.map((item, index) => ({
        id: item.playId,
        type: 'play',
        position: {
          x: (index % 3) * 300 + 100, // Simple grid layout
          y: Math.floor(index / 3) * 200 + 100
        },
        data: {
          playId: item.playId,
          title: item.play.title,
          section: item.section || undefined,
          tags: item.play.tags.map(tag => tag.name),
          notes: item.notes || undefined,
        }
      }))

      // Create edges for sequences
      const edges: FlowEdge[] = gamePlan.sequences.map(sequence => ({
        id: sequence.id,
        source: sequence.fromPlayId,
        target: sequence.toPlayId,
        type: sequence.condition ? 'conditional' : 'default',
        label: sequence.label || sequence.condition || undefined,
        data: {
          condition: sequence.condition || undefined,
          sequenceId: sequence.id,
        }
      }))

      return { nodes, edges }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async organizeGamePlanBySections(gamePlanId: string): Promise<OrganizedGamePlan> {
    try {
      const gamePlan = await prisma.gamePlan.findUnique({
        where: { id: gamePlanId },
        include: {
          items: {
            include: {
              play: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  diagramJSON: true,
                  tags: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      color: true
                    }
                  }
                }
              }
            },
            orderBy: { orderIndex: 'asc' }
          },
        }
      })

      if (!gamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      // Group items by section
      const sectionMap = new Map<string, typeof gamePlan.items>()
      const unorganizedPlays: typeof gamePlan.items = []

      gamePlan.items.forEach(item => {
        if (item.section) {
          if (!sectionMap.has(item.section)) {
            sectionMap.set(item.section, [])
          }
          sectionMap.get(item.section)!.push(item)
        } else {
          unorganizedPlays.push(item)
        }
      })

      // Convert to sections array with proper ordering
      const sections = Array.from(sectionMap.entries()).map(([name, plays], index) => ({
        name,
        plays: plays as any,
        order: COMMON_GAME_PLAN_SECTIONS.includes(name as any) 
          ? COMMON_GAME_PLAN_SECTIONS.indexOf(name as any)
          : 1000 + index
      })).sort((a, b) => a.order - b.order)

      return {
        id: gamePlan.id,
        title: gamePlan.title,
        sections,
        unorganizedPlays: unorganizedPlays as any,
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async generateShareToken(gamePlanId: string, userId: string): Promise<string> {
    try {
      // Verify user owns the game plan
      const gamePlan = await prisma.gamePlan.findUnique({
        where: { id: gamePlanId },
        select: { createdById: true }
      })

      if (!gamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      if (gamePlan.createdById !== userId) {
        throw new AppError('Not authorized to share this game plan', 403)
      }

      const shareToken = generateShareToken()
      
      await prisma.gamePlan.update({
        where: { id: gamePlanId },
        data: { shareToken }
      })

      return shareToken
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getGamePlanByShareToken(token: string): Promise<GamePlanWithRelations | null> {
    try {
      const gamePlan = await prisma.gamePlan.findUnique({
        where: { shareToken: token },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              play: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  diagramJSON: true,
                  tags: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      color: true
                    }
                  }
                }
              }
            },
            orderBy: { orderIndex: 'asc' }
          },
          sequences: true,
        },
      })

      return gamePlan as GamePlanWithRelations | null
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async analyzeGamePlan(gamePlanId: string): Promise<GamePlanAnalysis> {
    try {
      const gamePlan = await this.getGamePlanById(gamePlanId, true)
      
      if (!gamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      // Calculate play complexity
      const complexities = gamePlan.items.map(item => {
        const diagram = item.play.diagramJSON as any
        const actionCount = diagram?.actions?.length || 0
        const playerCount = diagram?.players?.length || 0
        return actionCount * 15 + playerCount * 10
      })

      const averageComplexity = complexities.length > 0 
        ? Math.round(complexities.reduce((sum, c) => sum + c, 0) / complexities.length)
        : 0

      // Tag distribution
      const tagDistribution: Record<string, number> = {}
      gamePlan.items.forEach(item => {
        item.play.tags.forEach(tag => {
          tagDistribution[tag.name] = (tagDistribution[tag.name] || 0) + 1
        })
      })

      // Generate recommendations and identify gaps
      const recommendations: string[] = []
      const gaps: GamePlanAnalysis['gaps'] = []

      // Check for essential situations
      const hasBlob = gamePlan.items.some(item => 
        item.play.tags.some(tag => tag.name === 'BLOB')
      )
      const hasSlob = gamePlan.items.some(item => 
        item.play.tags.some(tag => tag.name === 'SLOB')
      )
      const hasEndGame = gamePlan.items.some(item => 
        item.section?.toLowerCase().includes('end') || 
        item.play.tags.some(tag => tag.name.includes('Under'))
      )

      if (!hasBlob) {
        gaps.push({
          situation: 'Baseline Out of Bounds',
          severity: 'high',
          suggestion: 'Add BLOB plays for scoring opportunities near the basket'
        })
      }

      if (!hasSlob) {
        gaps.push({
          situation: 'Sideline Out of Bounds',
          severity: 'medium',
          suggestion: 'Add SLOB plays for ball advancement and scoring'
        })
      }

      if (!hasEndGame) {
        gaps.push({
          situation: 'End Game Situations',
          severity: 'high',
          suggestion: 'Add plays for final possessions and clock management'
        })
      }

      if (averageComplexity > 80) {
        recommendations.push('Consider simplifying some plays - high complexity may lead to execution errors')
      }

      if (gamePlan.items.length < 5) {
        recommendations.push('Add more plays to provide variety and alternatives')
      }

      if (gamePlan.sequences.length === 0) {
        recommendations.push('Create sequences between plays to show flow and counters')
      }

      return {
        playComplexity: {
          average: averageComplexity,
          distribution: complexities.reduce((acc, complexity) => {
            const range = complexity < 30 ? 'Low' : complexity < 60 ? 'Medium' : 'High'
            acc[range] = (acc[range] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        },
        tagDistribution,
        sequenceComplexity: gamePlan.sequences.length,
        recommendations,
        gaps,
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async getGamePlanStats(userId?: string): Promise<GamePlanStats> {
    try {
      const where = userId ? { createdById: userId } : {}

      const [
        totalGamePlans,
        gamePlansWithItems,
        playUsage,
        defenseTypeStats,
        recentActivity
      ] = await Promise.all([
        prisma.gamePlan.count({ where }),
        prisma.gamePlan.findMany({
          where,
          include: {
            items: true,
            _count: { select: { items: true } }
          }
        }),
        prisma.gamePlanItem.groupBy({
          by: ['playId'],
          _count: { playId: true },
          orderBy: { _count: { playId: 'desc' } },
          take: 10
        }),
        prisma.gamePlan.groupBy({
          by: ['defenseType'],
          _count: { id: true },
          where,
        }),
        prisma.gamePlan.findMany({
          where,
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: 'desc' },
          take: 5
        })
      ])

      const averagePlaysPerPlan = gamePlansWithItems.length > 0
        ? Math.round(gamePlansWithItems.reduce((sum, gp) => sum + gp._count.items, 0) / gamePlansWithItems.length)
        : 0

      // Get play titles for most used plays
      const playIds = playUsage.map(p => p.playId)
      const plays = await prisma.play.findMany({
        where: { id: { in: playIds } },
        select: { id: true, title: true }
      })

      const playLookup = new Map(plays.map(p => [p.id, p.title]))

      const mostUsedPlays = playUsage.map(p => ({
        playId: p.playId,
        playTitle: playLookup.get(p.playId) || 'Unknown Play',
        usageCount: p._count.playId
      }))

      const plansByDefenseType = defenseTypeStats.reduce((acc, stat) => {
        acc[stat.defenseType || 'Unspecified'] = stat._count.id
        return acc
      }, {} as Record<string, number>)

      const recentActivityFormatted = recentActivity.map(gp => ({
        id: gp.id,
        title: gp.title,
        action: (gp.createdAt.getTime() === gp.updatedAt.getTime() ? 'created' : 'updated') as 'created' | 'updated',
        date: gp.updatedAt
      }))

      return {
        totalGamePlans,
        averagePlaysPerPlan,
        mostUsedPlays,
        plansByDefenseType,
        recentActivity: recentActivityFormatted,
      }
    } catch (error) {
      throw handleServiceError(error)
    }
  }

  async duplicateGamePlan(gamePlanId: string, userId: string, newTitle?: string): Promise<GamePlanWithRelations> {
    try {
      const originalGamePlan = await this.getGamePlanById(gamePlanId, true)
      
      if (!originalGamePlan) {
        throw new AppError('Game plan not found', 404)
      }

      // Create new game plan
      const duplicatedGamePlan = await prisma.gamePlan.create({
        data: {
          title: newTitle || `${originalGamePlan.title} (Copy)`,
          description: originalGamePlan.description,
          opponent: originalGamePlan.opponent,
          defenseType: originalGamePlan.defenseType,
          createdById: userId,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              play: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  diagramJSON: true,
                  tags: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                      color: true
                    }
                  }
                }
              }
            }
          },
          sequences: true,
        },
      })

      // Copy items
      if (originalGamePlan.items.length > 0) {
        await prisma.gamePlanItem.createMany({
          data: originalGamePlan.items.map(item => ({
            gamePlanId: duplicatedGamePlan.id,
            playId: item.playId,
            section: item.section,
            notes: item.notes,
            orderIndex: item.orderIndex,
          }))
        })
      }

      // Copy sequences
      if (originalGamePlan.sequences.length > 0) {
        await prisma.gamePlanSequence.createMany({
          data: originalGamePlan.sequences.map(sequence => ({
            gamePlanId: duplicatedGamePlan.id,
            fromPlayId: sequence.fromPlayId,
            toPlayId: sequence.toPlayId,
            condition: sequence.condition,
            label: sequence.label,
          }))
        })
      }

      return await this.getGamePlanById(duplicatedGamePlan.id, true) as GamePlanWithRelations
    } catch (error) {
      throw handleServiceError(error)
    }
  }
}