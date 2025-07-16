// Configuration constants for OpenAI Realtime API

export const OPENAI_REALTIME_CONFIG = {
  // Model configuration
  MODEL: 'gpt-4o-realtime-preview-2024-10-01',
  
  // Default voice settings
  DEFAULT_VOICE: 'alloy' as const,
  AVAILABLE_VOICES: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const,
  
  // Audio configuration
  AUDIO: {
    SAMPLE_RATE: 24000,
    CHANNELS: 1,
    ECHO_CANCELLATION: true,
    NOISE_SUPPRESSION: true,
    AUTO_GAIN_CONTROL: true,
    BUFFER_SIZE: 4096
  },
  
  // Session configuration
  SESSION: {
    DEFAULT_TEMPERATURE: 0.8,
    DEFAULT_MODALITIES: ['text', 'audio'],
    EXPIRY_BUFFER_MS: 60000, // 1 minute buffer before expiry
    MAX_DURATION_MS: 3600000, // 1 hour max session
    HEARTBEAT_INTERVAL_MS: 30000 // 30 seconds
  },
  
  // Turn detection settings
  TURN_DETECTION: {
    TYPE: 'server_vad' as const,
    THRESHOLD: 0.5,
    SILENCE_DURATION_MS: 200,
    PREFIX_PADDING_MS: 300
  },
  
  // Connection settings
  CONNECTION: {
    TIMEOUT_MS: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
    EXPONENTIAL_BACKOFF: true,
    MAX_RETRY_DELAY_MS: 10000
  },
  
  // WebRTC configuration
  WEBRTC: {
    ICE_SERVERS: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    ICE_GATHERING_TIMEOUT_MS: 5000,
    CONNECTION_TIMEOUT_MS: 10000,
    PEER_CONNECTION_CONFIG: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    }
  },
  
  // API endpoints
  ENDPOINTS: {
    CREATE_SESSION: '/api/emma/realtime/session',
    CONNECT: '/api/emma/realtime/connect',
    DISCONNECT: '/api/emma/realtime/disconnect'
  },
  
  // Error codes
  ERROR_CODES: {
    // Connection errors
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
    NETWORK_ERROR: 'NETWORK_ERROR',
    
    // Authentication errors
    INVALID_API_KEY: 'INVALID_API_KEY',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    RATE_LIMITED: 'RATE_LIMITED',
    
    // Audio errors
    MICROPHONE_ACCESS_DENIED: 'MICROPHONE_ACCESS_DENIED',
    AUDIO_DEVICE_ERROR: 'AUDIO_DEVICE_ERROR',
    CODEC_NOT_SUPPORTED: 'CODEC_NOT_SUPPORTED',
    
    // Browser compatibility
    WEBRTC_NOT_SUPPORTED: 'WEBRTC_NOT_SUPPORTED',
    BROWSER_NOT_SUPPORTED: 'BROWSER_NOT_SUPPORTED',
    
    // Session errors
    SESSION_CREATION_FAILED: 'SESSION_CREATION_FAILED',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    
    // API errors
    API_ERROR: 'API_ERROR',
    OPENAI_ERROR: 'OPENAI_ERROR'
  },
  
  // User-friendly error messages
  ERROR_MESSAGES: {
    CONNECTION_FAILED: 'Unable to connect to Emma. Please check your internet connection and try again.',
    CONNECTION_TIMEOUT: 'Connection timed out. Please try again.',
    MICROPHONE_ACCESS_DENIED: 'Microphone access is required for voice chat. Please allow microphone access and try again.',
    WEBRTC_NOT_SUPPORTED: 'Your browser doesn\'t support voice chat. Please use Chrome, Firefox, or Safari.',
    SESSION_EXPIRED: 'Your session has expired. Please reconnect to continue.',
    RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
    GENERIC_ERROR: 'Something went wrong. Please try again.'
  }
} as const;

// Emma's personality configuration
export const EMMA_CONFIG = {
  DEFAULT_INSTRUCTIONS: `You are Emma, a friendly and helpful AI assistant. You have a warm, conversational personality and enjoy helping users with their questions and tasks. 

Key personality traits:
- Friendly and approachable
- Patient and understanding  
- Enthusiastic about helping
- Conversational and natural
- Encouraging and supportive

Communication style:
- Use natural, conversational language
- Be concise but thorough
- Ask clarifying questions when needed
- Show genuine interest in helping
- Maintain a positive, upbeat tone

Remember to:
- Listen actively to what the user is saying
- Respond naturally as if in a real conversation
- Handle interruptions gracefully
- Keep responses focused and relevant
- Be encouraging and supportive`,

  VOICE_SETTINGS: {
    voice: 'alloy' as const,
    temperature: 0.8,
    model: OPENAI_REALTIME_CONFIG.MODEL,
    modalities: ['text', 'audio'] as const,
    turnDetection: {
      type: 'server_vad' as const,
      threshold: 0.5,
      silenceDurationMs: 200,
      prefixPaddingMs: 300
    }
  }
} as const;

// Type exports for configuration
export type VoiceType = typeof OPENAI_REALTIME_CONFIG.AVAILABLE_VOICES[number];
export type ErrorCode = keyof typeof OPENAI_REALTIME_CONFIG.ERROR_CODES;
export type Endpoint = keyof typeof OPENAI_REALTIME_CONFIG.ENDPOINTS;