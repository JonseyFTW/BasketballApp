import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GamePlanService } from '@/modules/gamePlans/services/GamePlanService'
import { UpdateGamePlanDto } from '@/modules/gamePlans/types'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const gamePlanService = new GamePlanService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get('includeDetails') !== 'false'

    const gamePlan = await gamePlanService.getGamePlanById(params.id, includeDetails)
    
    if (!gamePlan) {
      return NextResponse.json(createErrorResponse('Game plan not found'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(gamePlan))
  } catch (error) {
    console.error('Error fetching game plan:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch game plan'),
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const body = await request.json()
    const dto: UpdateGamePlanDto = {
      title: body.title,
      description: body.description,
      opponent: body.opponent,
      gameDate: body.gameDate ? new Date(body.gameDate) : undefined,
      defenseType: body.defenseType,
    }

    const gamePlan = await gamePlanService.updateGamePlan(params.id, dto, session.user.id)
    return NextResponse.json(createSuccessResponse(gamePlan))
  } catch (error) {
    console.error('Error updating game plan:', error)
    const status = error instanceof Error && error.message.includes('Not authorized') ? 403 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to update game plan'),
      { status }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    await gamePlanService.deleteGamePlan(params.id, session.user.id)
    return NextResponse.json(createSuccessResponse(null))
  } catch (error) {
    console.error('Error deleting game plan:', error)
    const status = error instanceof Error && error.message.includes('Not authorized') ? 403 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to delete game plan'),
      { status }
    )
  }
}