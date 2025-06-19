import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/modules/users/services/UserService'
import { CreateUserDto, UserQueryParams } from '@/modules/users/types'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const userService = new UserService()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    const params: UserQueryParams = {
      role: searchParams.get('role') as any || undefined,
      teamId: searchParams.get('teamId') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') as any || 'createdAt',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
      includeStats: searchParams.get('includeStats') === 'true',
    }

    const result = await userService.getUsers(params)
    return NextResponse.json(createSuccessResponse(result))
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch users'),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const dto: CreateUserDto = {
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
      teamId: body.teamId,
    }

    const user = await userService.createUser(dto)
    return NextResponse.json(createSuccessResponse(user), { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to create user'),
      { status: 400 }
    )
  }
}