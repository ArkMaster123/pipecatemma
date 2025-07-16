import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, sdp, type } = await request.json()
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`https://api.openai.com/v1/realtime/sessions/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sdp: sdp,
        type: type
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      sdp: data.sdp,
      type: data.type
    })
  } catch (error) {
    console.error('Error connecting to realtime session:', error)
    return NextResponse.json(
      { error: 'Failed to connect to realtime session' },
      { status: 500 }
    )
  }
}
