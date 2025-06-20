import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AnimationService } from '@/modules/plays/services/AnimationService'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'
import { CreateAnimationDto, UpdateAnimationDto } from '@/modules/plays/types/animation'

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

    const { searchParams } = new URL(request.url)
    const animationId = searchParams.get('animationId')

    const animation = await animationService.getPlayAnimation(params.id, animationId || undefined)
    
    if (!animation) {
      return NextResponse.json(createErrorResponse('Animation not found'), { status: 404 })
    }

    return NextResponse.json(createSuccessResponse(animation))
  } catch (error) {
    console.error('Error fetching animation:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch animation'),
      { status: 500 }
    )
  }
}

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
    const dto: CreateAnimationDto = {
      playId: params.id,
      name: body.name,
      description: body.description,
      duration: body.duration,
      settings: body.settings,
    }

    const animation = await animationService.createAnimation(dto)
    return NextResponse.json(createSuccessResponse(animation), { status: 201 })
  } catch (error) {
    console.error('Error creating animation:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to create animation'),
      { status: 400 }
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

    const { searchParams } = new URL(request.url)
    const animationId = searchParams.get('animationId')
    
    if (!animationId) {
      return NextResponse.json(
        createErrorResponse('Animation ID is required'),
        { status: 400 }
      )
    }

    const body = await request.json()
    const dto: UpdateAnimationDto = {
      name: body.name,
      description: body.description,
      duration: body.duration,
      frames: body.frames,
      keyframes: body.keyframes,
      settings: body.settings,
    }

    const animation = await animationService.updateAnimation(animationId, dto)
    return NextResponse.json(createSuccessResponse(animation))
  } catch (error) {
    console.error('Error updating animation:', error)
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to update animation'),
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

    const { searchParams } = new URL(request.url)
    const animationId = searchParams.get('animationId')
    
    if (!animationId) {
      return NextResponse.json(
        createErrorResponse('Animation ID is required'),
        { status: 400 }
      )
    }

    await animationService.deleteAnimation(animationId)
    return NextResponse.json(createSuccessResponse(null))
  } catch (error) {
    console.error('Error deleting animation:', error)
    const status = error instanceof Error && error.message.includes('not found') ? 404 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to delete animation'),
      { status }
    )
  }
}