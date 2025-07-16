// Error types for OpenAI Realtime Voice interface

export enum ErrorCategory {
  CONNECTION = 'CONNECTION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUDIO = 'AUDIO',
  BROWSER_COMPATIBILITY = 'BROWSER_COMPATIBILITY',
  SESSION = 'SESSION',
  API = 'API'
}

export interface BaseError {
  category: ErrorCategory;
  code: string;
  message: string;
  userMessage: string;
  timestamp: Date;
  details?: any;
  recoverable: boolean;
}

export interface ConnectionError extends BaseError {
  category: ErrorCategory.CONNECTION;
  networkStatus?: 'offline' | 'slow' | 'unstable';
  retryCount?: number;
  lastAttempt?: Date;
}

export interface AuthenticationError extends BaseError {
  category: ErrorCategory.AUTHENTICATION;
  authType: 'api_key' | 'session' | 'rate_limit';
  statusCode?: number;
}

export interface AudioError extends BaseError {
  category: ErrorCategory.AUDIO;
  audioType: 'microphone' | 'speaker' | 'codec' | 'stream';
  deviceId?: string;
  permissions?: 'denied' | 'prompt' | 'granted';
}

export interface BrowserCompatibilityError extends BaseError {
  category: ErrorCategory.BROWSER_COMPATIBILITY;
  feature: 'webrtc' | 'mediarecorder' | 'webaudio' | 'permissions';
  browserInfo?: {
    name: string;
    version: string;
    platform: string;
  };
}

export interface SessionError extends BaseError {
  category: ErrorCategory.SESSION;
  sessionId?: string;
  sessionStatus?: 'creating' | 'active' | 'expired' | 'terminated';
}

export interface ApiError extends BaseError {
  category: ErrorCategory.API;
  endpoint: string;
  statusCode: number;
  openaiError?: {
    type: string;
    code: string;
    message: string;
  };
}

export type VoiceInterfaceError = 
  | ConnectionError 
  | AuthenticationError 
  | AudioError 
  | BrowserCompatibilityError 
  | SessionError 
  | ApiError;

// Error factory functions
export class ErrorFactory {
  static createConnectionError(
    code: string, 
    message: string, 
    userMessage: string, 
    details?: any
  ): ConnectionError {
    return {
      category: ErrorCategory.CONNECTION,
      code,
      message,
      userMessage,
      timestamp: new Date(),
      details,
      recoverable: true
    };
  }

  static createAuthenticationError(
    code: string,
    message: string,
    userMessage: string,
    authType: 'api_key' | 'session' | 'rate_limit',
    statusCode?: number
  ): AuthenticationError {
    return {
      category: ErrorCategory.AUTHENTICATION,
      code,
      message,
      userMessage,
      timestamp: new Date(),
      authType,
      statusCode,
      recoverable: authType === 'rate_limit'
    };
  }

  static createAudioError(
    code: string,
    message: string,
    userMessage: string,
    audioType: 'microphone' | 'speaker' | 'codec' | 'stream',
    permissions?: 'denied' | 'prompt' | 'granted'
  ): AudioError {
    return {
      category: ErrorCategory.AUDIO,
      code,
      message,
      userMessage,
      timestamp: new Date(),
      audioType,
      permissions,
      recoverable: permissions !== 'denied'
    };
  }

  static createBrowserCompatibilityError(
    code: string,
    message: string,
    userMessage: string,
    feature: 'webrtc' | 'mediarecorder' | 'webaudio' | 'permissions'
  ): BrowserCompatibilityError {
    return {
      category: ErrorCategory.BROWSER_COMPATIBILITY,
      code,
      message,
      userMessage,
      timestamp: new Date(),
      feature,
      recoverable: false
    };
  }

  static createSessionError(
    code: string,
    message: string,
    userMessage: string,
    sessionId?: string
  ): SessionError {
    return {
      category: ErrorCategory.SESSION,
      code,
      message,
      userMessage,
      timestamp: new Date(),
      sessionId,
      recoverable: true
    };
  }

  static createApiError(
    code: string,
    message: string,
    userMessage: string,
    endpoint: string,
    statusCode: number,
    openaiError?: any
  ): ApiError {
    return {
      category: ErrorCategory.API,
      code,
      message,
      userMessage,
      timestamp: new Date(),
      endpoint,
      statusCode,
      openaiError,
      recoverable: statusCode >= 500 || statusCode === 429
    };
  }
}