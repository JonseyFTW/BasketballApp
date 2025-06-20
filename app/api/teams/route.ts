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
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc',
      includeMembers: searchParams.get('includeMembers') === 'true',
    }

    const result = await userService.getTeams(params)
    return NextResponse.json(createSuccessResponse(result))
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch teams'),
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
      description: body.description,
    }

    const team = await userService.createTeam(dto)
    return NextResponse.json(createSuccessResponse(team), { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to create team'),
      { status: 400 }
    )
  }
}