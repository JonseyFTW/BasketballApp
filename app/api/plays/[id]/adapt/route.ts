import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlayService } from '@/modules/plays/services/PlayService'
import { AdaptPlayRequest } from '@/modules/plays/types'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const playService = new PlayService()

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
    const adaptRequest: AdaptPlayRequest = {
      playId: params.id,
      playerMappings: body.playerMappings,
    }

    const adaptedPlay = await playService.adaptPlayForPlayers(adaptRequest)
    return NextResponse.json(createSuccessResponse(adaptedPlay))
  } catch (error) {
    console.error('Error adapting play:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to adapt play'),
      { status: 400 }
    )
  }
}