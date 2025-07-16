// Main types export file for OpenAI Realtime Voice interface

// Core data models
export * from './realtime';

// API interfaces
export * from './api';

// Component interfaces
export * from './components';

// Error types
export * from './errors';

// Configuration constants
export * from './config';

// Re-export commonly used types for convenience
export type {
  RealtimeSession,
  VoiceConfig,
  TranscriptEntry,
  AudioConfig,
  AudioMetrics
} from './realtime';

export type {
  VoiceInterfaceError
} from './errors';

export type {
  VoiceInterfaceProps,
  ConnectionControlsProps,
  TranscriptDisplayProps
} from './components';

export type {
  CreateSessionRequest,
  CreateSessionResponse,
  ConnectRequest,
  ConnectResponse
} from './api';

export type {
  VoiceType,
  ErrorCode,
  Endpoint
} from './config';