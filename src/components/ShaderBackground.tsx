'use client'

import { useEffect, useRef } from 'react'

interface ShaderBackgroundProps {
  audioLevel?: number;
  voiceActivity?: number;
  botSpeaking?: boolean;
  quality?: number; // 0.1 to 1.0 - rendering quality
  intensity?: number; // 0.1 to 2.0 - effect intensity
  speed?: number; // 0.1 to 2.0 - animation speed
  complexity?: number; // 0.3 to 1.0 - complexity multiplier
}

export function ShaderBackground({ 
  audioLevel = 0, 
  voiceActivity = 0, 
  botSpeaking = false,
  quality = 0.7,
  intensity = 1.0,
  speed = 1.0,
  complexity = 0.6
}: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    // Vertex shader - simple fullscreen quad
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // Fragment shader - Optimized "Phosphor" with performance controls
    const fragmentShaderSource = `
      precision mediump float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform float uAudioLevel;
      uniform float uVoiceActivity;
      uniform float uBotSpeaking;
      uniform float uQuality;
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uComplexity;
      
      // Fast tanh approximation for WebGL
      vec4 tanh_fast(vec4 x) {
        vec4 x2 = x * x;
        return x * (27.0 + x2) / (27.0 + 9.0 * x2);
      }
      
      void mainImage(out vec4 O, vec2 I) {
        // Audio-reactive time modification
        float t = iTime * uSpeed + uAudioLevel * 0.5;
        float z = 0.0;
        float d = 0.0;
        float s = 0.0;
        
        // Audio reactivity multipliers
        float audioMult = 1.0 + uAudioLevel * 2.0 * uIntensity;
        float voiceMult = 1.0 + uVoiceActivity * 0.5 * uIntensity;
        float botGlow = uBotSpeaking * 0.3 + 1.0;
        
        // Clear fragColor and raymarch with fixed loop count
        O = vec4(0.0);
        for(float i = 0.0; i < 60.0; i += 1.0) {
          // Early exit based on quality setting
          if(i >= 20.0 + uQuality * 40.0) break;
          
          // Sample point (from ray direction)
          vec3 p = z * normalize(vec3(I + I, 0.0) - iResolution.xyy);
          // Rotation axis with audio influence
          vec3 a = normalize(cos(vec3(1.0, 2.0, 0.0) + t - d * 8.0 * audioMult));
          
          // Move camera back 5 units
          p.z += 5.0;
          // Rotated coordinates
          a = a * dot(a, p) - cross(a, p);
          
          // Turbulence loop with fixed count
          for(float j = 1.0; j < 8.0; j += 1.0) {
            // Early exit based on complexity setting
            if(j >= 3.0 + uComplexity * 5.0) break;
            a += sin(a * j + t * voiceMult).yzx / j;
          }
          
          // Distance to rings
          d = 0.1 * abs(length(p) - 3.0) + 0.04 * abs(a.y);
          s = a.y;
          z += d;
          
          // Coloring and brightness with bot speaking enhancement
          O += (cos(s + vec4(0.0, 1.0, 2.0, 0.0)) + 1.0) / d * z * botGlow * uIntensity;
        }
        
        // Fast tanh tonemap with audio enhancement
        O = tanh_fast(O / (30000.0 / (1.0 + uAudioLevel * 0.5)));
      }
      
      void main() {
        vec4 color;
        mainImage(color, gl_FragCoord.xy);
        gl_FragColor = color;
      }
    `

    // Create shader program
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    const program = createProgram(gl, vertexShader, fragmentShader)

    if (!vertexShader || !fragmentShader || !program) {
      console.error('Failed to create shader program')
      return
    }

    // Create buffer for fullscreen quad
    const positionBuffer = gl.createBuffer()
    if (!positionBuffer) {
      console.error('Failed to create buffer')
      return
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [-1, -1, 1, -1, -1, 1, 1, 1]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const timeLocation = gl.getUniformLocation(program, 'iTime')
    const resolutionLocation = gl.getUniformLocation(program, 'iResolution')
    const audioLevelLocation = gl.getUniformLocation(program, 'uAudioLevel')
    const voiceActivityLocation = gl.getUniformLocation(program, 'uVoiceActivity')
    const botSpeakingLocation = gl.getUniformLocation(program, 'uBotSpeaking')
    const qualityLocation = gl.getUniformLocation(program, 'uQuality')
    const intensityLocation = gl.getUniformLocation(program, 'uIntensity')
    const speedLocation = gl.getUniformLocation(program, 'uSpeed')
    const complexityLocation = gl.getUniformLocation(program, 'uComplexity')

    if (positionLocation === -1 || !timeLocation || !resolutionLocation || 
        !audioLevelLocation || !voiceActivityLocation || !botSpeakingLocation ||
        !qualityLocation || !intensityLocation || !speedLocation || !complexityLocation) {
      console.error('Failed to get shader locations')
      return
    }

    // Resize handler with quality-based resolution scaling
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      // Scale resolution based on quality setting
      const pixelRatio = window.devicePixelRatio * quality
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    // Animation loop
    let startTime = Date.now()
    const animate = () => {
      const currentTime = (Date.now() - startTime) * 0.001

      gl.useProgram(program)
      gl.uniform1f(timeLocation, currentTime)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform1f(audioLevelLocation, audioLevel)
      gl.uniform1f(voiceActivityLocation, voiceActivity)
      gl.uniform1f(botSpeakingLocation, botSpeaking ? 1.0 : 0.0)
      gl.uniform1f(qualityLocation, quality)
      gl.uniform1f(intensityLocation, intensity)
      gl.uniform1f(speedLocation, speed)
      gl.uniform1f(complexityLocation, complexity)

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      requestAnimationFrame(animate)
    }

    // Initialize
    resize()
    animate()

    // Handle resize
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      gl.deleteBuffer(positionBuffer)
    }
  }, [audioLevel, voiceActivity, botSpeaking, quality, intensity, speed, complexity])

  function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type)
    if (!shader) return null
    
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    
    return shader
  }

  function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader | null, fragmentShader: WebGLShader | null): WebGLProgram | null {
    if (!vertexShader || !fragmentShader) return null
    
    const program = gl.createProgram()
    if (!program) return null
    
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }
    
    return program
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
