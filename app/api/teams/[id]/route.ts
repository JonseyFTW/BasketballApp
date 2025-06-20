import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserService } from '@/modules/users/services/UserService'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

const userService = new UserService()

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
    const includeMembers = searchParams.get('includeMembers') !== 'false'

    const team = await userService.getTeamById(params.id, includeMembers)
    
    if (!team) {
      return NextResponse.json(createErrorResponse('Team not found'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(team))
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch team'),
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
    
    // Add update team method to UserService if needed - for now just return not implemented
    return NextResponse.json(
      createErrorResponse('Update team not implemented yet'),
      { status: 501 }
    )
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to update team'),
      { status: 500 }
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

    // Add delete team method to UserService if needed - for now just return not implemented
    return NextResponse.json(
      createErrorResponse('Delete team not implemented yet'),
      { status: 501 }
    )
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to delete team'),
      { status: 500 }
    )
  }
}