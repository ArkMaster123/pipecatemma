import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ success: true, message: 'Stopped listening' })
  } catch (error) {
    console.error('Error stopping listening:', error)
    return NextResponse.json(
      { error: 'Failed to stop listening' },
      { status: 500 }
    )
  }
}
