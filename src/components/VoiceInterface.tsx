'use client';

import { useState } from 'react';
import { usePipecatClient } from '@/hooks/usePipecatClient';
import { ShaderBackground } from './ShaderBackground';
import { Controls } from './Controls';
import { AudioVisualizer } from './AudioVisualizer';

export const VoiceInterface = () => {
  const [transcript, setTranscript] = useState<string[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  const { client, isConnected, connect, disconnect } = usePipecatClient({
    onTranscript: (text, isUser) => {
      setTranscript(prev => [...prev.slice(-10), `${isUser ? 'You' : 'Emma'}: ${text}`]);
    },
    onAudioLevel: setAudioLevel,
    onBotSpeaking: setIsBotSpeaking
  });

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <ShaderBackground 
        audioLevel={audioLevel}
        voiceActivity={isConnected ? 1 : 0}
        botSpeaking={isBotSpeaking}
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full mx-4 border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-6 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Emma - Your Home Care Assistant
          </h1>
          
          <AudioVisualizer 
            isConnected={isConnected}
            isBotSpeaking={isBotSpeaking}
            audioLevel={audioLevel}
          />
          
          <Controls 
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          
          <div className="mt-6 h-40 overflow-y-auto bg-black/20 rounded-lg p-4 border border-white/10">
            {transcript.length === 0 ? (
              <p className="text-gray-400 text-center italic">
                {isConnected ? 'Start speaking to Emma...' : 'Connect to start your conversation'}
              </p>
            ) : (
              transcript.map((line, index) => (
                <p key={index} className="text-sm text-white/90 mb-2 leading-relaxed">
                  {line}
                </p>
              ))
            )}
          </div>
          
          {isConnected && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Emma is ready to help with medication reminders, health check-ins, and emergency support
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
