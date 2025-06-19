import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, DefenseType, GameSituation } from '@prisma/client'
import { LiveRecommendationRequest, PlayRecommendation, LiveRecommendationResponse, DefenseTypeEnum } from '@/modules/live/types'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body: LiveRecommendationRequest = await request.json()
    const { 
      defenseType, 
      situation, 
      maxResults = 10,
      timeLeft,
      score,
      quarter
    } = body

    // Validate required fields
    if (!defenseType || !Object.values(DefenseTypeEnum).includes(defenseType as DefenseTypeEnum)) {
      return NextResponse.json(
        { success: false, error: 'Valid defense type is required' },
        { status: 400 }
      )
    }

    // Build query to find plays - first try to get plays with effectiveness data
    // If no effectiveness data exists, fall back to all plays with appropriate tags
    let plays = await prisma.play.findMany({
      where: {
        effectiveness: {
          some: {
            defenseType: defenseType,
            rating: {
              gte: 6.0 // Only recommend plays with rating 6+ (good effectiveness)
            }
          }
        }
      },
      include: {
        effectiveness: {
          where: {
            defenseType: defenseType
          }
        },
        tags: true,
        author: {
          select: {
            name: true
          }
        }
      },
      take: maxResults * 3
    })

    // If no plays found with effectiveness data, get all plays and create mock effectiveness
    if (plays.length === 0) {
      plays = await prisma.play.findMany({
        include: {
          effectiveness: true,
          tags: true,
          author: {
            select: {
              name: true
            }
          }
        },
        take: maxResults * 3
      })
    }

    // Process and rank recommendations
    const recommendations: PlayRecommendation[] = plays
      .map(play => {
        // Find the best effectiveness rating for this defense type
        // Prioritize situation-specific ratings if available, otherwise use general ratings
        let effectiveness = play.effectiveness.find(eff => 
          eff.defenseType === defenseType && eff.situation === situation
        )
        if (!effectiveness) {
          // Fall back to general effectiveness (no specific situation) or any effectiveness for this defense
          effectiveness = play.effectiveness.find(eff => 
            eff.defenseType === defenseType && (eff.situation === null || eff.situation === 'GENERAL')
          )
          if (!effectiveness) {
            effectiveness = play.effectiveness.find(eff => eff.defenseType === defenseType)
          }
        }
        
        // If no effectiveness data exists for this defense type, create a mock one
        if (!effectiveness) {
          effectiveness = {
            id: 'mock',
            playId: play.id,
            defenseType: defenseType,
            rating: 5.0, // Default rating
            successRate: null,
            difficulty: 5,
            situation: situation || 'GENERAL',
            notes: 'No effectiveness data available - using default rating',
            isVerified: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }

        // Calculate overall rating considering multiple factors
        let overallRating = effectiveness.rating
        let confidence = 0.8 // Base confidence
        const reasoning: string[] = []

        // Adjust rating based on difficulty vs effectiveness trade-off
        const difficultyPenalty = (effectiveness.difficulty - 5) * 0.1
        overallRating -= difficultyPenalty

        if (effectiveness.difficulty <= 4) {
          reasoning.push('Easy to execute under pressure')
          confidence += 0.1
        } else if (effectiveness.difficulty >= 8) {
          reasoning.push('High difficulty - use with experienced players')
          confidence -= 0.1
        }

        // Add situational reasoning
        if (effectiveness.rating >= 8.5) {
          reasoning.push('Highly effective against this defense')
        } else if (effectiveness.rating >= 7.0) {
          reasoning.push('Good effectiveness against this defense')
        } else if (effectiveness.id === 'mock') {
          reasoning.push('Using default effectiveness rating - add specific data for better recommendations')
        }

        // Add situation-specific bonus and reasoning
        if (situation && effectiveness.situation === situation) {
          overallRating += 0.5 // Bonus for situation-specific rating
          reasoning.push(`Specifically rated for ${situation.replace(/_/g, ' ').toLowerCase()} situations`)
          confidence += 0.1
        } else if (situation) {
          reasoning.push('General effectiveness rating (no specific situation data)')
          confidence -= 0.05 // Slight confidence penalty for not having situation-specific data
        }

        // Time-based adjustments for end game situations
        if (timeLeft && timeLeft < 120) { // Under 2 minutes
          if (play.tags.some((tag: any) => tag.name === 'End Game' || tag.name === 'Quick')) {
            overallRating += 0.5
            reasoning.push('Designed for end-game situations')
          }
        }

        // Add tag-based reasoning
        const playTypeTag = play.tags.find((tag: any) => 
          ['Motion', 'Pick and Roll', 'Horns', 'BLOB', 'SLOB'].includes(tag.name)
        )
        if (playTypeTag) {
          reasoning.push(`${playTypeTag.name} play type`)
        }

        return {
          play: play as any,
          effectiveness: [effectiveness],
          overallRating: Math.min(10, Math.max(1, overallRating)), // Clamp between 1-10
          confidence: Math.min(1, Math.max(0, confidence)),
          reasoning
        } as PlayRecommendation
      })
      .filter((rec): rec is PlayRecommendation => rec !== null)
      .sort((a, b) => b.overallRating - a.overallRating) // Sort by rating descending
      .slice(0, maxResults) // Take only requested number

    const response: LiveRecommendationResponse = {
      defenseType,
      situation,
      recommendations,
      totalPlaysConsidered: plays.length,
      generatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  // Support GET request with query parameters for quick testing
  const searchParams = request.nextUrl.searchParams
  const defenseType = searchParams.get('defenseType') as DefenseType
  const situation = searchParams.get('situation') as GameSituation
  const maxResults = parseInt(searchParams.get('maxResults') || '5')

  if (!defenseType) {
    return NextResponse.json(
      { success: false, error: 'defenseType query parameter is required' },
      { status: 400 }
    )
  }

  // Create a mock request body and process
  const mockRequest = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({
      defenseType,
      situation,
      maxResults
    })
  })

  return POST(mockRequest as NextRequest)
}