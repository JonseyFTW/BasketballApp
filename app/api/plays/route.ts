import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlayService } from '@/modules/plays/services/PlayService'
import { CreatePlayDto, PlayQueryParams } from '@/modules/plays/types'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const playService = new PlayService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const params: PlayQueryParams = {
      authorId: searchParams.get('authorId') || undefined,
      tags: searchParams.get('tags')?.split(',') || [],
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') as any || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') as any || 'createdAt',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
      includeRelations: searchParams.get('includeRelations') === 'true',
    }

    const result = await playService.getPlays(params)
    return NextResponse.json(createSuccessResponse(result))
  } catch (error) {
    console.error('Error fetching plays:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch plays'),
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
    const dto: CreatePlayDto = {
      title: body.title,
      description: body.description,
      diagramJSON: body.diagramJSON,
      tagIds: body.tagIds,
    }

    const play = await playService.createPlay(dto, session.user.id)
    return NextResponse.json(createSuccessResponse(play), { status: 201 })
  } catch (error) {
    console.error('Error creating play:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to create play'),
      { status: 400 }
    )
  }
}