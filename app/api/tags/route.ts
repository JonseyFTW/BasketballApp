import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createSuccessResponse, createErrorResponse } from '@/modules/common/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(createErrorResponse('Unauthorized'), { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const tags = await prisma.playTag.findMany({
      where: category ? { category: category as any } : undefined,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { plays: true }
        }
      }
    })

    return NextResponse.json(createSuccessResponse(tags))
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      createErrorResponse(error instanceof Error ? error.message : 'Failed to fetch tags'),
      { status: 500 }
    )
  }
}