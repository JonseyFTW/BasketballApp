import { NextRequest, NextResponse } from 'next/server'
import { PlayService } from '@/modules/plays/services/PlayService'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const playService = new PlayService()

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const play = await playService.getPlayByShareToken(params.token)
    
    if (!play) {
      return NextResponse.json(createErrorResponse('Shared play not found'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(play))
  } catch (error) {
    console.error('Error fetching shared play:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch shared play'),
      { status: 500 }
    )
  }
}