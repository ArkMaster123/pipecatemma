import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ success: true, message: 'Disconnected' })
  } catch (error) {
    console.error('Error disconnecting:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
