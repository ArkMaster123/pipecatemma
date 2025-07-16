import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Note: OpenAI Realtime sessions auto-expire, but we can clean up on our end
    return NextResponse.json({ success: true, message: 'Session disconnected' })
  } catch (error) {
    console.error('Error disconnecting from realtime session:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect from realtime session' },
      { status: 500 }
    )
  }
}
