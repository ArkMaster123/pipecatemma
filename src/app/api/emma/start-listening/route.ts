import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ success: true, message: 'Started listening' })
  } catch (error) {
    console.error('Error starting listening:', error)
    return NextResponse.json(
      { error: 'Failed to start listening' },
      { status: 500 }
    )
  }
}
