declare module '@pipecat-ai/client-js' {
  export interface PipecatClientOptions {
    transport: any;
    enableMic?: boolean;
    enableCam?: boolean;
  }

  export interface PipecatClient {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    on(event: string, callback: (data?: any) => void): void;
    off(event: string, callback: (data?: any) => void): void;
  }

  export class PipecatClient {
    constructor(options: PipecatClientOptions);
  }
}

declare module '@pipecat-ai/client-react' {
  export * from '@pipecat-ai/client-js';
}

declare module '@pipecat-ai/openai-realtime-webrtc-transport' {
  export interface OpenAIRealTimeWebRTCTransportOptions {
    api_key: string;
    settings?: {
      instructions?: string;
      voice?: string;
      modalities?: string[] | string;
      temperature?: number;
      max_tokens?: number | string;
      turn_detection?: {
        type: string;
        threshold?: number;
        silence_duration_ms?: number;
        prefix_padding_ms?: number;
      };
      input_audio_transcription?: {
        model: string;
      };
      tools?: any[];
      input_audio_format?: string;
      output_audio_format?: string;
    };
  }

  export class OpenAIRealTimeWebRTCTransport {
    constructor(options: OpenAIRealTimeWebRTCTransportOptions);
  }
}
