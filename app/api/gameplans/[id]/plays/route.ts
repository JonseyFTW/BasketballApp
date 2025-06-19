import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GamePlanService } from '@/modules/gamePlans/services/GamePlanService'
import { AddPlayToGamePlanDto } from '@/modules/gamePlans/types'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const gamePlanService = new GamePlanService()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const body = await request.json()
    const dto: AddPlayToGamePlanDto = {
      playId: body.playId,
      section: body.section,
      notes: body.notes,
      orderIndex: body.orderIndex,
    }

    await gamePlanService.addPlayToGamePlan(params.id, dto, session.user.id)
    return NextResponse.json(createSuccessResponse(null), { status: 201 })
  } catch (error) {
    console.error('Error adding play to game plan:', error)
    const status = error instanceof Error && error.message.includes('Not authorized') ? 403 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to add play to game plan'),
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

    const { searchParams } = new URL(request.url)
    const playId = searchParams.get('playId')

    if (!playId) {
      return NextResponse.json(createErrorResponse('Play ID is required'), { status: 400 })
    }

    await gamePlanService.removePlayFromGamePlan(params.id, playId, session.user.id)
    return NextResponse.json(createSuccessResponse(null))
  } catch (error) {
    console.error('Error removing play from game plan:', error)
    const status = error instanceof Error && error.message.includes('Not authorized') ? 403 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to remove play from game plan'),
      { status }
    )
  }
}