# AI Home Care Voice Agent - Implementation Plan

## Project Overview
Building a voice AI agent for home care using Pipecat's JavaScript SDK with OpenAI Realtime API and a custom shader-based UI/UX featuring the "Phosphor" shader.

## 🎯 Phase 1: Project Setup & Dependencies

### 1.1 Install Required Packages
```bash
cd ai-homecare
npm install @pipecat-ai/client-js @pipecat-ai/client-react
npm install @pipecat-ai/openai-realtime-webrtc-transport
npm install three @types/three
npm install glsl-shader-chunk
```

### 1.2 Environment Configuration
Create `.env.local`:
```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_USE_PRODUCTION=false
```

## 🎯 Phase 2: Core Architecture Setup

### 2.1 Directory Structure
```
src/
├── components/
│   ├── VoiceInterface.tsx          # Main voice interaction component
│   ├── ShaderBackground.tsx        # WebGL shader renderer
│   ├── AudioVisualizer.tsx         # Real-time audio visualization
│   └── Controls.tsx               # UI controls overlay
├── hooks/
│   ├── usePipecatClient.ts        # Pipecat client hook
│   └── useShaderRenderer.ts       # Shader rendering hook
├── shaders/
│   └── phosphor.glsl              # Phosphor shader code
├── utils/
│   └── audioProcessing.ts         # Audio processing utilities
└── types/
    └── pipecat.d.ts              # TypeScript definitions
```

### 2.2 TypeScript Definitions
Create `src/types/pipecat.d.ts`:
```typescript
declare module '@pipecat-ai/client-js';
declare module '@pipecat-ai/client-react';
declare module '@pipecat-ai/openai-realtime-webrtc-transport';
```

## 🎯 Phase 3: Pipecat Client Implementation

### 3.1 Create Pipecat Client Hook
Create `src/hooks/usePipecatClient.ts`:
```typescript
import { useState, useEffect, useCallback } from 'react';
import { PipecatClient } from '@pipecat-ai/client-js';
import { OpenAIRealTimeWebRTCTransport } from '@pipecat-ai/openai-realtime-webrtc-transport';

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

  const connect = useCallback(async () => {
    const newClient = new PipecatClient({
      transport: new OpenAIRealTimeWebRTCTransport({
        api_key: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
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
      }),
      enableMic: true,
      enableCam: false
    });

    // Event listeners
    newClient.on('connected', () => setIsConnected(true));
    newClient.on('disconnected', () => setIsConnected(false));
    newClient.on('bot-started-speaking', () => {
      setIsBotSpeaking(true);
      onBotSpeaking?.(true);
    });
    newClient.on('bot-stopped-speaking', () => {
      setIsBotSpeaking(false);
      onBotSpeaking?.(false);
    });
    newClient.on('user-transcript', ({ text }) => onTranscript?.(text, true));
    newClient.on('bot-transcript', ({ text }) => onTranscript?.(text, false));

    await newClient.connect();
    setClient(newClient);
  }, [onTranscript, onAudioLevel, onBotSpeaking]);

  const disconnect = useCallback(async () => {
    if (client) {
      await client.disconnect();
      setClient(null);
    }
  }, [client]);

  return {
    client,
    isConnected,
    isBotSpeaking,
    connect,
    disconnect
  };
};
```

## 🎯 Phase 4: Shader Background Implementation

### 4.1 Create Phosphor Shader
Create `src/shaders/phosphor.glsl`:
```glsl
// Phosphor shader adapted for audio reactivity
uniform float iTime;
uniform vec2 iResolution;
uniform float iAudioLevel;
uniform float iVoiceActivity;
uniform float iBotSpeaking;
uniform sampler2D iChannel0;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    
    // Audio-reactive phosphor effect
    float audioReact = iAudioLevel * 2.0;
    float voiceReact = iVoiceActivity * 0.5;
    float botReact = iBotSpeaking * 0.3;
    
    // Phosphor glow calculation
    vec3 color = vec3(0.0);
    float scanline = sin(uv.y * 800.0 + iTime * 2.0) * 0.04;
    
    // Audio-reactive color shifts
    color.r = 0.5 + 0.5 * sin(iTime + audioReact) + scanline;
    color.g = 0.8 + 0.2 * sin(iTime * 1.5 + voiceReact) + scanline;
    color.b = 1.0 - 0.3 * sin(iTime * 0.7 + botReact) + scanline;
    
    // Phosphor decay effect
    float decay = exp(-length(uv - 0.5) * 2.0);
    color *= decay * (1.0 + audioReact);
    
    fragColor = vec4(color, 1.0);
}
```

### 4.2 Create Shader Renderer Hook
Create `src/hooks/useShaderRenderer.ts`:
```typescript
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

interface UseShaderRendererProps {
  audioLevel?: number;
  voiceActivity?: number;
  botSpeaking?: boolean;
}

export const useShaderRenderer = ({
  audioLevel = 0,
  voiceActivity = 0,
  botSpeaking = false
}: UseShaderRendererProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const initShader = useCallback(() => {
    if (!mountRef.current) return;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create scene and camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // Load shader
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float iTime;
      uniform vec2 iResolution;
      uniform float iAudioLevel;
      uniform float iVoiceActivity;
      uniform float iBotSpeaking;
      
      ${document.getElementById('phosphor-shader')?.textContent || ''}
      
      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    // Create shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        iAudioLevel: { value: audioLevel },
        iVoiceActivity: { value: voiceActivity },
        iBotSpeaking: { value: botSpeaking ? 1.0 : 0.0 }
      },
      vertexShader,
      fragmentShader
    });
    materialRef.current = material;

    // Create quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !materialRef.current) return;
      
      materialRef.current.uniforms.iTime.value += 0.016;
      materialRef.current.uniforms.iAudioLevel.value = audioLevel;
      materialRef.current.uniforms.iVoiceActivity.value = voiceActivity;
      materialRef.current.uniforms.iBotSpeaking.value = botSpeaking ? 1.0 : 0.0;
      
      rendererRef.current.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!rendererRef.current || !materialRef.current) return;
      
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      materialRef.current.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [audioLevel, voiceActivity, botSpeaking]);

  useEffect(() => {
    const cleanup = initShader();
    return cleanup;
  }, [initShader]);

  return mountRef;
};
```

## 🎯 Phase 5: UI Components

### 5.1 Create Voice Interface Component
Create `src/components/VoiceInterface.tsx`:
```typescript
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
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 max-w-2xl w-full mx-4">
          <h1 className="text-3xl font-bold text-white mb-4 text-center">
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
          
          <div className="mt-4 h-32 overflow-y-auto bg-black/30 rounded p-3">
            {transcript.map((line, index) => (
              <p key={index} className="text-sm text-white/80 mb-1">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 5.2 Create Controls Component
Create `src/components/Controls.tsx`:
```typescript
interface ControlsProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Controls = ({ isConnected, onConnect, onDisconnect }: ControlsProps) => {
  return (
    <div className="flex justify-center space-x-4">
      {!isConnected ? (
        <button
          onClick={onConnect}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Connect to Emma
        </button>
      ) : (
        <button
          onClick={onDisconnect}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      )}
    </div>
  );
};
```

## 🎯 Phase 6: Integration & Testing

### 6.1 Update Main Page
Update `src/app/page.tsx`:
```typescript
import { VoiceInterface } from '@/components/VoiceInterface';

export default function Home() {
  return <VoiceInterface />;
}
```

### 6.2 Add Shader Script to Layout
Update `src/app/layout.tsx`:
```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script id="phosphor-shader" type="x-shader/x-fragment">
          {/* Shader code will be injected here */}
        </script>
      </head>
      <body className="bg-black">{children}</body>
    </html>
  );
}
```

## 🎯 Phase 7: Development Commands

### 7.1 Development Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### 7.2 Testing Checklist
- [ ] OpenAI API key configured in `.env.local`
- [ ] Pipecat client connects successfully
- [ ] Shader background renders correctly
- [ ] Audio visualization responds to voice
- [ ] Transcription displays in real-time
- [ ] Function calls work (medication reminders, emergency contact)
- [ ] Responsive design on mobile devices
- [ ] Performance optimization (60 FPS target)

## 🎯 Phase 8: Production Considerations

### 8.1 Security Updates
- Move API keys to server-side
- Implement rate limiting
- Add user authentication
- Enable HTTPS enforcement

### 8.2 Performance Optimization
- Implement shader LOD system
- Add audio processing optimization
- Enable lazy loading for components
- Add connection retry logic

## 🎯 Next Steps
1. Complete Phase 1-3 setup
2. Test OpenAI Realtime integration
3. Implement shader audio reactivity
4. Add function calling capabilities
5. Optimize for production deployment
6. Add comprehensive error handling
7. Implement user feedback system
8. Add analytics and monitoring
