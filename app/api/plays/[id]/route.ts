import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlayService } from '@/modules/plays/services/PlayService'
import { UpdatePlayDto } from '@/modules/plays/types'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const playService = new PlayService()

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
    const includeRelations = searchParams.get('includeRelations') === 'true'

    const play = await playService.getPlayById(params.id, includeRelations)
    
    if (!play) {
      return NextResponse.json(createErrorResponse('Play not found'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(play))
  } catch (error) {
    console.error('Error fetching play:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch play'),
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
    const dto: UpdatePlayDto = {
      title: body.title,
      description: body.description,
      diagramJSON: body.diagramJSON,
      tagIds: body.tagIds,
    }

    const play = await playService.updatePlay(params.id, dto, session.user.id)
    return NextResponse.json(createSuccessResponse(play))
  } catch (error) {
    console.error('Error updating play:', error)
    const status = error instanceof Error && error.message.includes('Not authorized') ? 403 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to update play'),
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

    await playService.deletePlay(params.id, session.user.id)
    return NextResponse.json(createSuccessResponse(null))
  } catch (error) {
    console.error('Error deleting play:', error)
    const status = error instanceof Error && error.message.includes('Not authorized') ? 403 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to delete play'),
      { status }
    )
  }
}