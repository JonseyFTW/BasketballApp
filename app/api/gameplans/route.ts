import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GamePlanService } from '@/modules/gamePlans/services/GamePlanService'
import { CreateGamePlanDto, GamePlanQueryParams } from '@/modules/gamePlans/types'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const gamePlanService = new GamePlanService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const params: GamePlanQueryParams = {
      createdById: searchParams.get('createdById') || undefined,
      opponent: searchParams.get('opponent') || undefined,
      defenseType: searchParams.get('defenseType') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') as any || 'createdAt',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
      includeItems: searchParams.get('includeItems') === 'true',
      includeSequences: searchParams.get('includeSequences') === 'true',
    }

    const result = await gamePlanService.getGamePlans(params)
    return NextResponse.json(createSuccessResponse(result))
  } catch (error) {
    console.error('Error fetching game plans:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch game plans'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const body = await request.json()
    const dto: CreateGamePlanDto = {
      title: body.title,
      description: body.description,
      opponent: body.opponent,
      gameDate: body.gameDate ? new Date(body.gameDate) : undefined,
      defenseType: body.defenseType,
    }

    const gamePlan = await gamePlanService.createGamePlan(dto, session.user.id)
    return NextResponse.json(createSuccessResponse(gamePlan), { status: 201 })
  } catch (error) {
    console.error('Error creating game plan:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to create game plan'),
      { status: 400 }
    )
  }
}