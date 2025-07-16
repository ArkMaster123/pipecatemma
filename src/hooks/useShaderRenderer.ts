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
  const animationRef = useRef<number | null>(null);

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

    // Phosphor shader
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
      animationRef.current = requestAnimationFrame(animate);
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
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [audioLevel, voiceActivity, botSpeaking]);

  useEffect(() => {
    const cleanup = initShader();
    return cleanup;
  }, [initShader]);

  return mountRef;
};
