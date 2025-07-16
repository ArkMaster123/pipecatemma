import { NextRequest, NextResponse } from 'next/server'
import { CreateSessionRequest, CreateSessionResponse, ApiErrorResponse } from '@/types/api'
import { ErrorFactory, ErrorCategory } from '@/types/errors'

// Default configuration for Emma
const DEFAULT_CONFIG = {
  model: 'gpt-4o-realtime-preview-2024-12-17',
  voice: 'alloy' as const,
  instructions: `You are Emma, a friendly and helpful AI assistant. You provide assistance with various tasks while maintaining a warm, conversational tone. You can understand and respond to voice naturally, including handling interruptions and maintaining context throughout the conversation.`,
  temperature: 0.8,
  modalities: ['text', 'audio'],
  turn_detection: {
    type: 'server_vad' as const,
    threshold: 0.5,
    silence_duration_ms: 200,
    prefix_padding_ms: 300
  }
}

// Input validation schema
function validateSessionRequest(body: any): CreateSessionRequest {
  const errors: string[] = []
  
  // Validate voice parameter
  if (body.voice && !['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(body.voice)) {
    errors.push('Invalid voice parameter. Must be one of: alloy, echo, fable, onyx, nova, shimmer')
  }
  
  // Validate temperature parameter
  if (body.temperature !== undefined) {
    if (typeof body.temperature !== 'number' || body.temperature < 0 || body.temperature > 2) {
      errors.push('Invalid temperature parameter. Must be a number between 0 and 2')
    }
  }
  
  // Validate instructions parameter
  if (body.instructions !== undefined) {
    if (typeof body.instructions !== 'string' || body.instructions.length > 10000) {
      errors.push('Invalid instructions parameter. Must be a string with maximum 10000 characters')
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`)
  }
  
  return {
    voice: body.voice,
    instructions: body.instructions,
    temperature: body.temperature
  }
}

// Map OpenAI API errors to user-friendly messages
function mapOpenAIError(statusCode: number, errorBody: any): ApiErrorResponse {
  const timestamp = new Date().toISOString()
  
  switch (statusCode) {
    case 400:
      return {
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid request parameters',
          details: errorBody
        },
        timestamp
      }
    case 401:
      return {
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Invalid or missing API key',
          details: 'Please check your OpenAI API key configuration'
        },
        timestamp
      }
    case 403:
      return {
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to OpenAI Realtime API',
          details: 'Your API key may not have access to the Realtime API'
        },
        timestamp
      }
    case 429:
      return {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded',
          details: 'Please wait before making another request'
        },
        timestamp
      }
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        error: {
          code: 'SERVER_ERROR',
          message: 'OpenAI service temporarily unavailable',
          details: 'Please try again in a few moments'
        },
        timestamp
      }
    default:
      return {
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: errorBody
        },
        timestamp
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check API key configuration
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      const error = ErrorFactory.createAuthenticationError(
        'MISSING_API_KEY',
        'OpenAI API key not configured',
        'Server configuration error. Please contact support.',
        'api_key'
      )
      return NextResponse.json(
        { error: error },
        { status: 500 }
      )
    }

    // Parse and validate request body
    let requestBody: CreateSessionRequest
    try {
      const body = await request.json()
      requestBody = validateSessionRequest(body)
    } catch (parseError) {
      const error = ErrorFactory.createApiError(
        'INVALID_REQUEST_BODY',
        parseError instanceof Error ? parseError.message : 'Invalid request body',
        'Please check your request parameters and try again.',
        '/api/emma/realtime/session',
        400
      )
      return NextResponse.json(
        { error: error },
        { status: 400 }
      )
    }

    // Build session configuration
    const sessionConfig = {
      model: DEFAULT_CONFIG.model,
      voice: requestBody.voice || DEFAULT_CONFIG.voice,
      instructions: requestBody.instructions || DEFAULT_CONFIG.instructions,
      temperature: requestBody.temperature !== undefined ? requestBody.temperature : DEFAULT_CONFIG.temperature,
      modalities: DEFAULT_CONFIG.modalities,
      turn_detection: DEFAULT_CONFIG.turn_detection
    }

    // Debug: Log what we're sending to OpenAI
    console.log('Sending to OpenAI:', {
      url: 'https://api.openai.com/v1/realtime/sessions',
      config: sessionConfig
    })

    // Create session with OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'realtime=v1'
      },
      body: JSON.stringify(sessionConfig),
    })

    // Handle OpenAI API errors
    if (!response.ok) {
      let errorBody
      try {
        errorBody = await response.json()
      } catch {
        errorBody = { message: 'Unknown error' }
      }
      
      const mappedError = mapOpenAIError(response.status, errorBody)
      console.error('OpenAI API error:', {
        status: response.status,
        error: errorBody,
        config: sessionConfig
      })
      
      return NextResponse.json(
        mappedError,
        { status: response.status >= 500 ? 503 : response.status }
      )
    }

    // Parse successful response
    const data = await response.json()
    
    // Debug: Log the actual response from OpenAI
    console.log('OpenAI API Response:', JSON.stringify(data, null, 2))
    
    // Validate response structure
    if (!data.id || !data.client_secret?.value) {
      console.error('Invalid OpenAI response structure:', data)
      const error = ErrorFactory.createApiError(
        'INVALID_RESPONSE',
        `Invalid response from OpenAI API. Expected 'id' and 'client_secret.value' fields. Got: ${JSON.stringify(data)}`,
        'Service temporarily unavailable. Please try again.',
        '/api/emma/realtime/session',
        502
      )
      return NextResponse.json(
        { error: error },
        { status: 502 }
      )
    }

    const sessionResponse: CreateSessionResponse = {
      sessionId: data.id,
      expiresAt: data.client_secret.expires_at, // Use the client_secret expires_at
      clientSecret: data.client_secret.value    // Extract the actual secret value
    }

    console.log('Session created successfully:', {
      sessionId: sessionResponse.sessionId,
      expiresAt: new Date(sessionResponse.expiresAt * 1000).toISOString(),
      voice: sessionConfig.voice,
      temperature: sessionConfig.temperature
    })

    return NextResponse.json(sessionResponse)

  } catch (error) {
    console.error('Unexpected error creating realtime session:', error)
    
    const apiError = ErrorFactory.createApiError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown internal error',
      'An unexpected error occurred. Please try again.',
      '/api/emma/realtime/session',
      500
    )
    
    return NextResponse.json(
      { error: apiError },
      { status: 500 }
    )
  }
}
