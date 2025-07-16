// Core data models for OpenAI Realtime Voice interface

export interface RealtimeSession {
  sessionId: string;
  expiresAt: number;
  clientSecret?: string;
  status: 'creating' | 'active' | 'expired' | 'terminated';
  createdAt: Date;
}

export interface VoiceConfig {
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  instructions: string;
  temperature: number;
  model: string;
  modalities: string[];
  turnDetection: TurnDetectionConfig;
}

export interface TurnDetectionConfig {
  type: 'server_vad' | 'none';
  threshold?: number;
  silenceDurationMs?: number;
  prefixPaddingMs?: number;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface AudioStreamConfig {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate?: number;
}

export interface AudioMetrics {
  inputLevel: number;
  outputLevel: number;
  latency: number;
  packetLoss: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TranscriptEntry {
  id: string;
  sessionId: string;
  speaker: 'user' | 'emma';
  text: string;
  timestamp: Date;
  confidence: number;
  audioUrl?: string;
}

export interface ConversationSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  entries: TranscriptEntry[];
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  totalDuration?: number;
  messageCount: number;
  averageResponseTime?: number;
  audioQuality?: AudioMetrics;
}