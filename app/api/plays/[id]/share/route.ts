import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PlayService } from '@/modules/plays/services/PlayService'
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

    const shareToken = await playService.generateShareToken(params.id, session.user.id)
    const shareUrl = `${process.env.NEXTAUTH_URL}/share/play/${shareToken}`
    
    return NextResponse.json(createSuccessResponse({ shareToken, shareUrl }))
  } catch (error) {
    console.error('Error generating share token:', error)
    const status = error instanceof Error && error.message.includes('Not authorized') ? 403 : 400
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to generate share token'),
      { status }
    )
  }
}