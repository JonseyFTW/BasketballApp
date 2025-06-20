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

    const player = await userService.getPlayerProfileById(params.id)
    
    if (!player) {
      return NextResponse.json(createErrorResponse('Player not found'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(player))
  } catch (error) {
    console.error('Error fetching player:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch player'),
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
    const dto = {
      name: body.name,
      number: body.number,
      position: body.position,
      attributes: body.attributes,
      teamId: body.teamId,
    }

    const player = await userService.updatePlayerProfile(params.id, dto, session.user.id)
    return NextResponse.json(createSuccessResponse(player))
  } catch (error) {
    console.error('Error updating player:', error)
    const status = error instanceof Error && error.message.includes('Not authorized') ? 403 : 
                   error instanceof Error && error.message.includes('not found') ? 404 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to update player'),
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

    // Add delete method to UserService if needed - for now just return not implemented
    return NextResponse.json(
      createErrorResponse('Delete player not implemented yet'),
      { status: 501 }
    )
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to delete player'),
      { status: 500 }
    )
  }
}