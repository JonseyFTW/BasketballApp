import { NextResponse } from 'next/server'
import { GameSituation } from '@prisma/client'
import { GAME_SITUATION_INFO } from '@/modules/live/types'

export async function GET() {
  try {
    // Return all game situations with their metadata
    const gameSituations = Object.values(GAME_SITUATION_INFO)
    
    return NextResponse.json({
      success: true,
      data: gameSituations
    })
  } catch (error) {
    console.error('Error fetching game situations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game situations' },
      { status: 500 }
    )
  }
}