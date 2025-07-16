import { NextRequest, NextResponse } from 'next/server'
import { DisconnectRequest, DisconnectResponse, ApiErrorResponse } from '@/types/api'
import { ErrorFactory } from '@/types/errors'

// Disconnect timeout in milliseconds
const DISCONNECT_TIMEOUT = 10000 // 10 seconds
const MAX_CLEANUP_ATTEMPTS = 2

// Validate disconnect request
function validateDisconnectRequest(body: any): DisconnectRequest {
  const errors: string[] = []
  
  // Validate sessionId
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string')
  } else if (!/^[a-zA-Z0-9_-]+$/.test(body.sessionId)) {
    errors.push('sessionId contains invalid characters')
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`)
  }
  
  return {
    sessionId: body.sessionId
  }
}

// Check session status with OpenAI API
async function checkSessionStatus(sessionId: string, apiKey: string): Promise<{
  exists: boolean;
  status?: string;
  error?: any;
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for status check
    
    const response = await fetch(`https://api.openai.com/v1/realtime/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (response.status === 404) {
      return { exists: false }
    }
    
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }))
      return { exists: false, error: errorBody }
    }
    
    const data = await response.json()
    return { 
      exists: true, 
      status: data.status || 'unknown'
    }
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { exists: false, error: 'Timeout checking session status' }
    }
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Attempt graceful session termination
async function terminateSession(sessionId: string, apiKey: string, attempt: number = 1): Promise<{
  success: boolean;
  error?: any;
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DISCONNECT_TIMEOUT)
    
    // Attempt to terminate the session
    const response = await fetch(`https://api.openai.com/v1/realtime/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    // Session successfully terminated or already gone
    if (response.ok || response.status === 404) {
      return { success: true }
    }
    
    // Retry on server errors
    if (attempt < MAX_CLEANUP_ATTEMPTS && response.status >= 500) {
      console.log(`Session termination attempt ${attempt} failed with status ${response.status}, retrying...`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay
      return terminateSession(sessionId, apiKey, attempt + 1)
    }
    
    const errorBody = await response.json().catch(() => ({ message: 'Unknown error' }))
    return { success: false, error: errorBody }
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Termination timeout' }
    }
    
    // Retry on network errors
    if (attempt < MAX_CLEANUP_ATTEMPTS) {
      console.log(`Session termination attempt ${attempt} failed with error: ${error}, retrying...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return terminateSession(sessionId, apiKey, attempt + 1)
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Map disconnect errors
function mapDisconnectError(error: any, sessionId: string): ApiErrorResponse {
  const timestamp = new Date().toISOString()
  
  return {
    error: {
      code: 'DISCONNECT_FAILED',
      message: 'Failed to cleanly disconnect session',
      details: `Session ${sessionId} may still be active. It will auto-expire according to OpenAI's policy.`
    },
    timestamp,
    requestId: `disconnect-${sessionId}-${Date.now()}`
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
    let disconnectRequest: DisconnectRequest
    try {
      const body = await request.json()
      disconnectRequest = validateDisconnectRequest(body)
    } catch (parseError) {
      const error = ErrorFactory.createApiError(
        'INVALID_REQUEST_BODY',
        parseError instanceof Error ? parseError.message : 'Invalid request body',
        'Please provide a valid sessionId to disconnect.',
        '/api/emma/realtime/disconnect',
        400
      )
      return NextResponse.json(
        { error: error },
        { status: 400 }
      )
    }

    const { sessionId } = disconnectRequest

    console.log('Attempting to disconnect session:', { sessionId })

    // First, check if the session exists and its current status
    const sessionStatus = await checkSessionStatus(sessionId, apiKey)
    
    if (!sessionStatus.exists) {
      // Session doesn't exist or already terminated
      const response: DisconnectResponse = {
        success: true,
        message: 'Session was already disconnected or expired'
      }
      
      console.log('Session already disconnected:', { sessionId })
      return NextResponse.json(response)
    }

    console.log('Session status check:', { 
      sessionId, 
      exists: sessionStatus.exists, 
      status: sessionStatus.status 
    })

    // Attempt graceful termination
    const terminationResult = await terminateSession(sessionId, apiKey)
    
    if (terminationResult.success) {
      const response: DisconnectResponse = {
        success: true,
        message: 'Session disconnected successfully'
      }
      
      console.log('Session disconnected successfully:', { sessionId })
      return NextResponse.json(response)
    } else {
      // Termination failed, but we'll still report success since sessions auto-expire
      console.warn('Session termination failed, but session will auto-expire:', {
        sessionId,
        error: terminationResult.error
      })
      
      const response: DisconnectResponse = {
        success: true,
        message: 'Session disconnect initiated. Session will auto-expire if still active.'
      }
      
      return NextResponse.json(response)
    }

  } catch (error) {
    console.error('Unexpected error during session disconnect:', error)
    
    // Even if we encounter an error, we'll return success since OpenAI sessions auto-expire
    // This ensures the client can proceed with cleanup
    const response: DisconnectResponse = {
      success: true,
      message: 'Disconnect request processed. Session will auto-expire according to OpenAI policy.'
    }
    
    return NextResponse.json(response)
  }
}

// Handle GET requests to check session status
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const url = new URL(request.url)
    const sessionId = url.searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId parameter is required' },
        { status: 400 }
      )
    }

    const sessionStatus = await checkSessionStatus(sessionId, apiKey)
    
    return NextResponse.json({
      sessionId,
      exists: sessionStatus.exists,
      status: sessionStatus.status,
      error: sessionStatus.error
    })

  } catch (error) {
    console.error('Error checking session status:', error)
    return NextResponse.json(
      { error: 'Failed to check session status' },
      { status: 500 }
    )
  }
}
