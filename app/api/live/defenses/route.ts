import { NextResponse } from 'next/server'
import { DEFENSE_TYPE_INFO } from '@/modules/live/types'

export async function GET() {
  try {
    // Return all defense types with their metadata
    const defenseTypes = Object.values(DEFENSE_TYPE_INFO)
    
    return NextResponse.json({
      success: true,
      data: defenseTypes
    })
  } catch (error) {
    console.error('Error fetching defense types:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch defense types' },
      { status: 500 }
    )
  }
}