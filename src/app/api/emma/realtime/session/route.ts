import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-10-01',
        voice: 'alloy',
        instructions: `You are Emma, a friendly and helpful AI assistant. You provide assistance with various tasks while maintaining a warm, conversational tone. You can understand and respond to voice naturally, including handling interruptions and maintaining context throughout the conversation.`
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({
      sessionId: data.id,
      expiresAt: data.expires_at,
      clientSecret: data.client_secret
    })
  } catch (error) {
    console.error('Error creating realtime session:', error)
    return NextResponse.json(
      { error: 'Failed to create realtime session' },
      { status: 500 }
    )
  }
}
