import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GamePlanService } from '@/modules/gamePlans/services/GamePlanService'
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

    const flowChart = await gamePlanService.getGamePlanFlowChart(params.id)
    return NextResponse.json(createSuccessResponse(flowChart))
  } catch (error) {
    console.error('Error fetching game plan flowchart:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch flowchart'),
      { status: 500 }
    )
  }
}