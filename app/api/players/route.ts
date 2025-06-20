import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/modules/users/services/UserService'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const userService = new UserService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = {
      teamId: searchParams.get('teamId') || undefined,
      coachId: searchParams.get('coachId') || undefined,
      position: searchParams.get('position') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc',
    }

    const result = await userService.getPlayerProfiles(params)
    return NextResponse.json(createSuccessResponse(result))
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch players'),
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
    const dto = {
      name: body.name,
      number: body.number,
      position: body.position,
      attributes: body.attributes,
      teamId: body.teamId,
    }

    const player = await userService.createPlayerProfile(dto, session.user.id)
    return NextResponse.json(createSuccessResponse(player), { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to create player'),
      { status: 400 }
    )
  }
}