'use client';

import { useShaderRenderer } from '@/hooks/useShaderRenderer';

interface ShaderBackgroundProps {
  audioLevel?: number;
  voiceActivity?: number;
  botSpeaking?: boolean;
}

export const ShaderBackground = ({ 
  audioLevel = 0, 
  voiceActivity = 0, 
  botSpeaking = false 
}: ShaderBackgroundProps) => {
  const mountRef = useShaderRenderer({
    audioLevel,
    voiceActivity,
    botSpeaking
  });

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
};
