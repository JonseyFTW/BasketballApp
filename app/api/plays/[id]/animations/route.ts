import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AnimationService } from '@/modules/plays/services/AnimationService'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const animationService = new AnimationService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const animations = await animationService.getPlayAnimations(params.id)
    return NextResponse.json(createSuccessResponse(animations))
  } catch (error) {
    console.error('Error fetching animations:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch animations'),
      { status: 500 }
    )
  }
}