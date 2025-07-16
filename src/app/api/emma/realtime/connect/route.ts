import { NextRequest, NextResponse } from 'next/server'
import { ConnectRequest, ConnectResponse, ApiErrorResponse } from '@/types/api'
import { ErrorFactory } from '@/types/errors'

// Connection timeout in milliseconds
const CONNECTION_TIMEOUT = 30000 // 30 seconds
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY_BASE = 1000 // 1 second base delay

// SDP validation patterns
const SDP_PATTERNS = {
  offer: /^v=0\r?\n.*a=sendrecv|a=sendonly|a=recvonly/s,
  answer: /^v=0\r?\n.*a=sendrecv|a=sendonly|a=recvonly/s
}

// Validate SDP format
function validateSDP(sdp: string, type: 'offer' | 'answer'): boolean {
  if (!sdp || typeof sdp !== 'string') {
    return false
  }
  
  // Basic SDP structure validation
  if (!sdp.startsWith('v=0')) {
    return false
  }
  
  // Check for required SDP lines
  const requiredLines = ['v=', 'o=', 's=', 't=', 'm=']
  for (const line of requiredLines) {
    if (!sdp.includes(line)) {
      return false
    }
  }
  
  // Validate against pattern for type
  return SDP_PATTERNS[type].test(sdp)
}

// Validate connection request
function validateConnectRequest(body: any): ConnectRequest {
  const errors: string[] = []
  
  // Validate sessionId
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string')
  } else if (!/^[a-zA-Z0-9_-]+$/.test(body.sessionId)) {
    errors.push('sessionId contains invalid characters')
  }
  
  // Validate SDP
  if (!body.sdp || typeof body.sdp !== 'string') {
    errors.push('sdp is required and must be a string')
  }
  
  // Validate type
  if (!body.type || !['offer', 'answer'].includes(body.type)) {
    errors.push('type is required and must be either "offer" or "answer"')
  }
  
  // Validate SDP format if basic validation passed
  if (body.sdp && body.type && ['offer', 'answer'].includes(body.type)) {
    if (!validateSDP(body.sdp, body.type)) {
      errors.push(`Invalid SDP format for type "${body.type}"`)
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`)
  }
  
  return {
    sessionId: body.sessionId,
    sdp: body.sdp,
    type: body.type
  }
}

// Map WebRTC-specific errors
function mapWebRTCError(statusCode: number, errorBody: any, sessionId: string): ApiErrorResponse {
  const timestamp = new Date().toISOString()
  
  switch (statusCode) {
    case 400:
      return {
        error: {
          code: 'INVALID_SDP',
          message: 'Invalid SDP or connection parameters',
          details: 'Please check your WebRTC offer/answer format'
        },
        timestamp,
        requestId: `connect-${sessionId}-${Date.now()}`
      }
    case 404:
      return {
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found or expired',
          details: 'Please create a new session and try again'
        },
        timestamp,
        requestId: `connect-${sessionId}-${Date.now()}`
      }
    case 409:
      return {
        error: {
          code: 'CONNECTION_CONFLICT',
          message: 'Session already has an active connection',
          details: 'Please disconnect existing connection before creating a new one'
        },
        timestamp,
        requestId: `connect-${sessionId}-${Date.now()}`
      }
    case 429:
      return {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many connection attempts',
          details: 'Please wait before attempting to connect again'
        },
        timestamp,
        requestId: `connect-${sessionId}-${Date.now()}`
      }
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        error: {
          code: 'CONNECTION_FAILED',
          message: 'WebRTC connection could not be established',
          details: 'Service temporarily unavailable. Please try again.'
        },
        timestamp,
        requestId: `connect-${sessionId}-${Date.now()}`
      }
    default:
      return {
        error: {
          code: 'WEBRTC_ERROR',
          message: 'WebRTC connection error',
          details: errorBody
        },
        timestamp,
        requestId: `connect-${sessionId}-${Date.now()}`
      }
  }
}

// Retry logic with exponential backoff
async function retryConnection(
  sessionId: string, 
  sdp: string, 
  type: 'offer' | 'answer',
  apiKey: string,
  attempt: number = 1
): Promise<Response> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT)
    
    const response = await fetch(`https://api.openai.com/v1/realtime/sessions/${sessionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sdp, type }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    // If successful or non-retryable error, return response
    if (response.ok || (response.status < 500 && response.status !== 429)) {
      return response
    }
    
    // Retry for server errors and rate limits
    if (attempt < MAX_RETRY_ATTEMPTS && (response.status >= 500 || response.status === 429)) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1) // Exponential backoff
      console.log(`Connection attempt ${attempt} failed with status ${response.status}, retrying in ${delay}ms`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryConnection(sessionId, sdp, type, apiKey, attempt + 1)
    }
    
    return response
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Connection timeout')
    }
    
    // Retry on network errors
    if (attempt < MAX_RETRY_ATTEMPTS) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1)
      console.log(`Connection attempt ${attempt} failed with error: ${error}, retrying in ${delay}ms`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryConnection(sessionId, sdp, type, apiKey, attempt + 1)
    }
    
    throw error
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
    let connectRequest: ConnectRequest
    try {
      const body = await request.json()
      connectRequest = validateConnectRequest(body)
    } catch (parseError) {
      const error = ErrorFactory.createApiError(
        'INVALID_REQUEST_BODY',
        parseError instanceof Error ? parseError.message : 'Invalid request body',
        'Please check your WebRTC connection parameters and try again.',
        '/api/emma/realtime/connect',
        400
      )
      return NextResponse.json(
        { error: error },
        { status: 400 }
      )
    }

    console.log('Attempting WebRTC connection:', {
      sessionId: connectRequest.sessionId,
      type: connectRequest.type,
      sdpLength: connectRequest.sdp.length
    })

    // Attempt connection with retry logic
    let response: Response
    try {
      response = await retryConnection(
        connectRequest.sessionId,
        connectRequest.sdp,
        connectRequest.type,
        apiKey
      )
    } catch (retryError) {
      const error = ErrorFactory.createConnectionError(
        'CONNECTION_TIMEOUT',
        retryError instanceof Error ? retryError.message : 'Connection timeout',
        'Connection attempt timed out. Please check your network and try again.'
      )
      return NextResponse.json(
        { error: error },
        { status: 408 }
      )
    }

    // Handle OpenAI API errors
    if (!response.ok) {
      let errorBody
      try {
        errorBody = await response.json()
      } catch {
        errorBody = { message: 'Unknown error' }
      }
      
      const mappedError = mapWebRTCError(response.status, errorBody, connectRequest.sessionId)
      console.error('WebRTC connection error:', {
        status: response.status,
        sessionId: connectRequest.sessionId,
        error: errorBody
      })
      
      return NextResponse.json(
        mappedError,
        { status: response.status >= 500 ? 503 : response.status }
      )
    }

    // Parse successful response
    const data = await response.json()
    
    // Validate response structure
    if (!data.sdp || !data.type) {
      const error = ErrorFactory.createApiError(
        'INVALID_RESPONSE',
        'Invalid response from OpenAI API',
        'Service temporarily unavailable. Please try again.',
        '/api/emma/realtime/connect',
        502
      )
      return NextResponse.json(
        { error: error },
        { status: 502 }
      )
    }

    // Validate returned SDP
    if (!validateSDP(data.sdp, data.type)) {
      const error = ErrorFactory.createApiError(
        'INVALID_RESPONSE_SDP',
        'Invalid SDP in response from OpenAI API',
        'Service returned invalid connection data. Please try again.',
        '/api/emma/realtime/connect',
        502
      )
      return NextResponse.json(
        { error: error },
        { status: 502 }
      )
    }

    const connectResponse: ConnectResponse = {
      sdp: data.sdp,
      type: data.type
    }

    console.log('WebRTC connection established successfully:', {
      sessionId: connectRequest.sessionId,
      responseType: connectResponse.type,
      responseSdpLength: connectResponse.sdp.length
    })

    return NextResponse.json(connectResponse)

  } catch (error) {
    console.error('Unexpected error in WebRTC connection:', error)
    
    const apiError = ErrorFactory.createApiError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown internal error',
      'An unexpected error occurred during connection. Please try again.',
      '/api/emma/realtime/connect',
      500
    )
    
    return NextResponse.json(
      { error: apiError },
      { status: 500 }
    )
  }
}
