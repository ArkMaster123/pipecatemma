import { useState, useCallback, useEffect } from 'react';
import { PipecatClient } from '@pipecat-ai/client-js';
import { OpenAIRealTimeWebRTCTransport } from '@pipecat-ai/openai-realtime-webrtc-transport';
import { DailyTransport } from '@pipecat-ai/daily-transport';

interface UsePipecatClientProps {
  onTranscript?: (text: string, isUser: boolean) => void;
  onAudioLevel?: (level: number) => void;
  onBotSpeaking?: (isSpeaking: boolean) => void;
}

export const usePipecatClient = ({
  onTranscript,
  onAudioLevel,
  onBotSpeaking
}: UsePipecatClientProps) => {
  const [client, setClient] = useState<PipecatClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found. Please check your .env.local file.');
      }

      console.log('🔌 Connecting to OpenAI Realtime API...');
      
      // Use OpenAI Realtime transport for development
      const transport = new OpenAIRealTimeWebRTCTransport({
        api_key: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        settings: {
          instructions: `You are Emma, a compassionate home care assistant for elderly users. 
            Provide gentle, patient support with daily tasks, medication reminders, health monitoring, 
            and emotional companionship. Speak clearly and warmly. Always be patient and understanding.`,
          voice: "coral",
          modalities: ["text", "audio"],
          temperature: 0.7,
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            silence_duration_ms: 500,
            prefix_padding_ms: 300
          },
          input_audio_transcription: {
            model: "gpt-4o-transcribe"
          },
          tools: [
            {
              type: "function",
              name: "set_medication_reminder",
              description: "Set a medication reminder for the user",
              parameters: {
                type: "object",
                properties: {
                  medication: { type: "string", description: "Name of the medication" },
                  time: { type: "string", description: "Time to take medication (HH:MM format)" },
                  dosage: { type: "string", description: "Amount to take" }
                },
                required: ["medication", "time"]
              }
            },
            {
              type: "function",
              name: "emergency_contact",
              description: "Contact emergency services or family members",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["emergency", "family", "doctor"] },
                  message: { type: "string", description: "Message to send" }
                },
                required: ["type", "message"]
              }
            },
            {
              type: "function",
              name: "health_check_in",
              description: "Record daily health check-in",
              parameters: {
                type: "object",
                properties: {
                  mood: { type: "string", description: "How are you feeling today?" },
                  pain_level: { type: "number", minimum: 0, maximum: 10 },
                  sleep_quality: { type: "string", enum: ["poor", "fair", "good", "excellent"] }
                }
              }
            }
          ]
        }
      });

      const newClient = new PipecatClient({
        transport,
        enableMic: true,
        enableCam: false
      });

      // Enhanced event listeners with debugging
      newClient.on('connected', () => {
        console.log('✅ Successfully connected to OpenAI Realtime API');
        setIsConnected(true);
        setError(null);
        setIsConnecting(false);
      });

      newClient.on('disconnected', () => {
        console.log('❌ Disconnected from OpenAI Realtime API');
        setIsConnected(false);
        setIsConnecting(false);
      });

      newClient.on('error', (error) => {
        console.error('❌ Pipecat client error:', error);
        setError(error.message || 'Connection error occurred');
        setIsConnecting(false);
      });

      newClient.on('bot-started-speaking', () => {
        console.log('🗣️ Emma started speaking');
        setIsBotSpeaking(true);
        onBotSpeaking?.(true);
      });

      newClient.on('bot-stopped-speaking', () => {
        console.log('🔇 Emma stopped speaking');
        setIsBotSpeaking(false);
        onBotSpeaking?.(false);
      });

      newClient.on('user-transcript', ({ text }) => {
        console.log('👤 User said:', text);
        onTranscript?.(text, true);
      });

      newClient.on('bot-transcript', ({ text }) => {
        console.log('🤖 Emma said:', text);
        onTranscript?.(text, false);
      });

      await newClient.connect();
      setClient(newClient);
      
    } catch (err) {
      console.error('❌ Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsConnecting(false);
    }
  }, [onTranscript, onBotSpeaking]);

  const disconnect = useCallback(async () => {
    try {
      if (client) {
        await client.disconnect();
        setClient(null);
        setIsConnected(false);
        console.log('✅ Successfully disconnected');
      }
    } catch (err) {
      console.error('❌ Disconnect error:', err);
      setError(err instanceof Error ? err.message : 'Disconnect failed');
    }
  }, [client]);

  return {
    client,
    isConnected,
    isBotSpeaking,
    error,
    isConnecting,
    connect,
    disconnect
  };
};
