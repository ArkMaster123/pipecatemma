// API request and response interfaces for OpenAI Realtime Voice

export interface CreateSessionRequest {
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  instructions?: string;
  temperature?: number;
}

export interface CreateSessionResponse {
  sessionId: string;
  expiresAt: number;
  clientSecret: string;
}

export interface ConnectRequest {
  sessionId: string;
  sdp: string;
  type: 'offer' | 'answer';
}

export interface ConnectResponse {
  sdp: string;
  type: 'offer' | 'answer';
}

export interface DisconnectRequest {
  sessionId: string;
}

export interface DisconnectResponse {
  success: boolean;
  message?: string;
}

export interface SessionConfig {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  instructions: string;
  temperature: number;
  model: string;
  modalities: string[];
  turnDetection: {
    type: 'server_vad' | 'none';
    threshold?: number;
    silenceDurationMs?: number;
    prefixPaddingMs?: number;
  };
}

// API Error Response
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId?: string;
}