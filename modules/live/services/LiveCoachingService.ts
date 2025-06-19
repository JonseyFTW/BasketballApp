import { PrismaClient, DefenseType, GameSituation } from '@prisma/client'
import { 
  LiveRecommendationRequest, 
  PlayRecommendation, 
  LiveRecommendationResponse,
  DEFENSE_TYPE_INFO 
} from '../types'

export class LiveCoachingService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async getRecommendations(request: LiveRecommendationRequest): Promise<LiveRecommendationResponse> {
    const { 
      defenseType, 
      situation, 
      maxResults = 10,
      timeLeft,
      score,
      quarter,
      playerPreferences
    } = request

    // Build the base query
    const whereClause: any = {
      effectiveness: {
        some: {
          defenseType: defenseType,
          rating: {
            gte: 6.0 // Only recommend effective plays
          }
        }
      }
    }

    // Add situation filter if provided
    if (situation) {
      whereClause.effectiveness.some.situation = situation
    }

    // Fetch plays with all related data
    const plays = await this.prisma.play.findMany({
      where: whereClause,
      include: {
        effectiveness: {
          where: {
            defenseType: defenseType,
            ...(situation && { situation })
          }
        },
        tags: true,
        author: {
          select: {
            id: true,
            name: true
          }
        },
        relationsFrom: {
          include: {
            relatedPlay: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      take: maxResults * 3 // Get more for better filtering
    })

    // Process recommendations with advanced scoring
    const recommendations: PlayRecommendation[] = plays
      .map(play => this.scorePlay(play, request))
      .filter((rec): rec is PlayRecommendation => rec !== null)
      .sort((a, b) => b.overallRating - a.overallRating)
      .slice(0, maxResults)

    return {
      defenseType,
      situation,
      recommendations,
      totalPlaysConsidered: plays.length,
      generatedAt: new Date()
    }
  }

  private scorePlay(play: any, request: LiveRecommendationRequest): PlayRecommendation | null {
    const effectiveness = play.effectiveness[0]
    if (!effectiveness) return null

    let overallRating = effectiveness.rating
    let confidence = 0.8
    const reasoning: string[] = []

    // Base effectiveness reasoning
    if (effectiveness.rating >= 9.0) {
      reasoning.push('Extremely effective against this defense')
      confidence += 0.15
    } else if (effectiveness.rating >= 8.0) {
      reasoning.push('Highly effective against this defense')
      confidence += 0.1
    } else if (effectiveness.rating >= 7.0) {
      reasoning.push('Good effectiveness against this defense')
    } else {
      reasoning.push('Moderate effectiveness')
      confidence -= 0.1
    }

    // Difficulty adjustments
    if (effectiveness.difficulty <= 3) {
      reasoning.push('Very easy to execute')
      overallRating += 0.3
      confidence += 0.1
    } else if (effectiveness.difficulty <= 5) {
      reasoning.push('Easy to execute under pressure')
      overallRating += 0.1
    } else if (effectiveness.difficulty >= 8) {
      reasoning.push('High difficulty - requires experienced players')
      overallRating -= 0.3
      confidence -= 0.15
    } else if (effectiveness.difficulty >= 6) {
      reasoning.push('Moderate difficulty')
      overallRating -= 0.1
    }

    // Time and situation adjustments
    this.applyTimeAdjustments(play, request, overallRating, reasoning, confidence)
    this.applyScoreAdjustments(play, request, overallRating, reasoning)
    this.applyTagAdjustments(play, reasoning)

    // Defense-specific adjustments
    this.applyDefenseSpecificAdjustments(play, request.defenseType, overallRating, reasoning)

    // Add counter-play information
    if (play.relationsFrom.length > 0) {
      const counters = play.relationsFrom
        .filter((rel: any) => rel.relationType === 'COUNTER')
        .map((rel: any) => rel.relatedPlay.title)
      
      if (counters.length > 0) {
        reasoning.push(`Has counters: ${counters.slice(0, 2).join(', ')}`)
      }
    }

    return {
      play: {
        ...play,
        author: play.author
      },
      effectiveness: [effectiveness],
      overallRating: Math.min(10, Math.max(1, overallRating)),
      confidence: Math.min(1, Math.max(0, confidence)),
      reasoning
    }
  }

  private applyTimeAdjustments(
    play: any, 
    request: LiveRecommendationRequest, 
    overallRating: number, 
    reasoning: string[], 
    confidence: number
  ) {
    const { timeLeft, quarter } = request
    
    if (timeLeft && timeLeft < 120) { // Under 2 minutes
      if (play.tags.some((tag: any) => ['End Game', 'Last Shot', 'Quick'].includes(tag.name))) {
        overallRating += 0.5
        reasoning.push('Designed for end-game situations')
        confidence += 0.1
      }
    }

    if (timeLeft && timeLeft < 30) { // Under 30 seconds
      if (play.tags.some((tag: any) => tag.name === 'Quick')) {
        overallRating += 0.3
        reasoning.push('Quick execution for time pressure')
      }
    }
  }

  private applyScoreAdjustments(
    play: any,
    request: LiveRecommendationRequest,
    overallRating: number,
    reasoning: string[]
  ) {
    if (!request.score) return

    const deficit = request.score.them - request.score.us

    if (deficit > 10) { // Need quick scores
      if (play.tags.some((tag: any) => ['Quick', 'Fast Break', 'Transition'].includes(tag.name))) {
        overallRating += 0.4
        reasoning.push('Fast-scoring play for deficit situation')
      }
    } else if (deficit < -10) { // Leading by a lot
      if (play.tags.some((tag: any) => ['Motion', 'Ball Movement'].includes(tag.name))) {
        overallRating += 0.2
        reasoning.push('Ball control play to maintain lead')
      }
    }
  }

  private applyTagAdjustments(play: any, reasoning: string[]) {
    // Add descriptive reasoning based on play type
    const tags = play.tags.map((tag: any) => tag.name)
    
    if (tags.includes('Motion')) {
      reasoning.push('Motion offense with multiple options')
    }
    if (tags.includes('Pick and Roll')) {
      reasoning.push('Pick and roll action')
    }
    if (tags.includes('Three-Point')) {
      reasoning.push('Designed for three-point scoring')
    }
    if (tags.includes('BLOB') || tags.includes('SLOB')) {
      reasoning.push('Out-of-bounds play')
    }
  }

  private applyDefenseSpecificAdjustments(
    play: any,
    defenseType: DefenseType,
    overallRating: number,
    reasoning: string[]
  ) {
    const defenseInfo = DEFENSE_TYPE_INFO[defenseType]
    
    // Check if play tags match common counters for this defense
    const playTagNames = play.tags.map((tag: any) => tag.name)
    const matchingCounters = defenseInfo.commonCounters.filter(counter => 
      playTagNames.some(tag => tag.toLowerCase().includes(counter.toLowerCase()) || 
                             counter.toLowerCase().includes(tag.toLowerCase()))
    )

    if (matchingCounters.length > 0) {
      overallRating += 0.2 * matchingCounters.length
      reasoning.push(`Targets ${defenseInfo.name} weaknesses`)
    }
  }

  async getFavoritePlaysByCoach(coachId: string, defenseType?: DefenseType): Promise<any[]> {
    // This would integrate with user preferences when that feature is built
    // For now, return top-rated plays for the coach
    const whereClause: any = {
      authorId: coachId
    }

    if (defenseType) {
      whereClause.effectiveness = {
        some: {
          defenseType: defenseType,
          rating: { gte: 7.0 }
        }
      }
    }

    return this.prisma.play.findMany({
      where: whereClause,
      include: {
        tags: true,
        effectiveness: defenseType ? {
          where: { defenseType }
        } : true
      },
      take: 10
    })
  }

  async getPlayStatistics(playId: string) {
    // Get comprehensive statistics for a play
    const play = await this.prisma.play.findUnique({
      where: { id: playId },
      include: {
        effectiveness: {
          include: {
            play: {
              select: {
                title: true
              }
            }
          }
        },
        tags: true,
        relationsFrom: {
          include: {
            relatedPlay: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        relationsTo: {
          include: {
            play: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    })

    if (!play) throw new Error('Play not found')

    // Calculate average rating across all defenses
    const avgRating = play.effectiveness.reduce((sum, eff) => sum + eff.rating, 0) / play.effectiveness.length
    const avgDifficulty = play.effectiveness.reduce((sum, eff) => sum + eff.difficulty, 0) / play.effectiveness.length

    return {
      play,
      stats: {
        averageRating: avgRating,
        averageDifficulty: avgDifficulty,
        totalEffectivenessEntries: play.effectiveness.length,
        counters: play.relationsFrom.filter(rel => rel.relationType === 'COUNTER'),
        alternatives: play.relationsFrom.filter(rel => rel.relationType === 'ALTERNATIVE')
      }
    }
  }

  async disconnect() {
    await this.prisma.$disconnect()
  }
}