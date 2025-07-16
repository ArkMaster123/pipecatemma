// Component prop interfaces for OpenAI Realtime Voice components

import { TranscriptEntry, VoiceConfig, RealtimeSession, AudioMetrics, AudioConfig } from './realtime';
import { VoiceInterfaceError } from './errors';

// VoiceInterface Component
export interface VoiceInterfaceProps {
  initialConfig?: VoiceConfig;
  onError?: (error: VoiceInterfaceError) => void;
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
  onConnectionStateChange?: (connected: boolean) => void;
}

export interface VoiceInterfaceState {
  isConnected: boolean;
  isListening: boolean;
  isMuted: boolean;
  transcript: TranscriptEntry[];
  session: RealtimeSession | null;
  error: string | null;
  connectionState: RTCPeerConnectionState;
}

// AudioManager Component
export interface AudioManagerProps {
  session: RealtimeSession;
  onAudioLevel?: (level: number) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onError?: (error: VoiceInterfaceError) => void;
}

// TranscriptDisplay Component
export interface TranscriptDisplayProps {
  entries: TranscriptEntry[];
  maxEntries?: number;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  showConfidence?: boolean;
  onClear?: () => void;
  onExport?: () => void;
}

// ConnectionControls Component
export interface ConnectionControlsProps {
  isConnected: boolean;
  isListening: boolean;
  isMuted: boolean;
  connectionState?: RTCPeerConnectionState;
  audioLevel?: number;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onToggleListening: () => void;
  onToggleMute: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// AudioVisualizer Component
export interface AudioVisualizerProps {
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'linear' | 'waveform';
  showLabels?: boolean;
}

// Error Display Component
export interface ErrorDisplayProps {
  error: VoiceInterfaceError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

// Session Status Component
export interface SessionStatusProps {
  session: RealtimeSession | null;
  connectionState: RTCPeerConnectionState;
  audioMetrics?: AudioMetrics;
  showDetails?: boolean;
}

// Voice Configuration Component
export interface VoiceConfigProps {
  config: VoiceConfig;
  onChange: (config: VoiceConfig) => void;
  disabled?: boolean;
}

// Hook interfaces
export interface UseVoiceInterfaceOptions {
  initialConfig?: Partial<VoiceConfig>;
  autoConnect?: boolean;
  onError?: (error: VoiceInterfaceError) => void;
}

export interface UseVoiceInterfaceReturn {
  // State
  isConnected: boolean;
  isListening: boolean;
  isMuted: boolean;
  transcript: TranscriptEntry[];
  session: RealtimeSession | null;
  error: VoiceInterfaceError | null;
  connectionState: RTCPeerConnectionState;
  audioLevel: number;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleListening: () => void;
  toggleMute: () => void;
  clearTranscript: () => void;
  updateConfig: (config: Partial<VoiceConfig>) => void;
  
  // Utils
  retry: () => Promise<void>;
  clearError: () => void;
}

export interface UseAudioManagerOptions {
  session: RealtimeSession;
  audioConfig?: Partial<AudioConfig>;
  onError?: (error: VoiceInterfaceError) => void;
}

export interface UseAudioManagerReturn {
  audioLevel: number;
  connectionState: RTCPeerConnectionState;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  mute: () => void;
  unmute: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
}