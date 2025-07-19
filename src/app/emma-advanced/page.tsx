'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react'
import { ShaderBackground } from '@/components/ShaderBackground'

interface EphemeralSession {
  sessionId: string;
  expiresAt: number;
  clientSecret: string;
}

interface TranscriptEntry {
  speaker: 'user' | 'emma';
  text: string;
  timestamp: Date;
}

export default function EmmaAdvancedPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [session, setSession] = useState<EphemeralSession | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected')

  // Shader animation states
  const [audioLevel, setAudioLevel] = useState(0)
  const [voiceActivity, setVoiceActivity] = useState(0)
  const [botSpeaking, setBotSpeaking] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const outputSourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const handleConnect = async () => {
    try {
      setConnectionStatus('Creating session...')

      // Step 1: Get ephemeral token from our backend
      const response = await fetch('/api/emma/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice: 'alloy',
          instructions: 'You are Emma, a friendly and helpful AI assistant. You provide assistance with various tasks while maintaining a warm, conversational tone.',
          temperature: 0.8
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle our API's error structure: { error: { message: "..." } }
        const errorMessage = data.error?.message || data.message || 'Failed to create session'
        throw new Error(errorMessage)
      }

      setSession(data)
      setConnectionStatus('Connecting to OpenAI...')

      // Step 2: Initialize WebRTC connection directly to OpenAI
      await initializeWebRTCConnection(data.clientSecret)

    } catch (error) {
      console.error('Failed to connect:', error)
      setConnectionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setConnectionStatus('Disconnected'), 3000)
    }
  }

  const initializeWebRTCConnection = async (ephemeralKey: string) => {
    try {
      setConnectionStatus('Setting up audio...')

      // Get user media for microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000
        }
      })

      localStreamRef.current = stream

      // Create peer connection
      const pc = new RTCPeerConnection()
      peerConnectionRef.current = pc

      // Set up audio element for remote audio
      if (audioRef.current) {
        audioRef.current.autoplay = true
      }

      // Handle remote audio stream
      pc.ontrack = (event) => {
        console.log('Received remote audio track')
        if (audioRef.current && event.streams[0]) {
          audioRef.current.srcObject = event.streams[0]
          audioRef.current.play().catch(e => console.log('Audio play failed:', e))

          // Set up output audio analysis for Emma's voice
          setupOutputAudioAnalysis(audioRef.current)
        }
      }

      // Add local audio track
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Set up data channel for events
      const dataChannel = pc.createDataChannel('oai-events')
      dataChannelRef.current = dataChannel

      dataChannel.addEventListener('open', () => {
        console.log('Data channel opened')
        setConnectionStatus('Connected')
        setIsConnected(true)
        setIsListening(true) // Auto-start listening with WebRTC

        // Send initial session update
        sendEvent({
          type: 'session.update',
          session: {
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            }
          }
        })
      })

      dataChannel.addEventListener('message', handleServerEvent)

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState)
        setConnectionStatus(`Connection: ${pc.connectionState}`)

        if (pc.connectionState === 'connected') {
          setIsConnected(true)
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false)
          setIsListening(false)
        }
      }

      // Create offer
      setConnectionStatus('Creating WebRTC offer...')
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Connect directly to OpenAI Realtime API
      setConnectionStatus('Connecting to OpenAI WebRTC...')
      const baseUrl = 'https://api.openai.com/v1/realtime'
      const model = 'gpt-4o-realtime-preview-2024-12-17'

      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          'Authorization': `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp'
        }
      })

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text()
        throw new Error(`WebRTC connection failed: ${sdpResponse.status} ${errorText}`)
      }

      const answerSdp = await sdpResponse.text()
      const answer = {
        type: 'answer' as RTCSdpType,
        sdp: answerSdp
      }

      await pc.setRemoteDescription(answer)
      console.log('WebRTC connection established')

    } catch (error) {
      console.error('Failed to initialize WebRTC connection:', error)
      setConnectionStatus(`WebRTC Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setTimeout(() => setConnectionStatus('Disconnected'), 5000)
    }
  }

  const sendEvent = (event: any) => {
    if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
      console.log('Sending event:', event)
      dataChannelRef.current.send(JSON.stringify(event))
    } else {
      console.warn('Data channel not ready, cannot send event:', event)
    }
  }

  const handleServerEvent = (event: MessageEvent) => {
    try {
      const serverEvent = JSON.parse(event.data)
      console.log('Received server event:', serverEvent)

      switch (serverEvent.type) {
        case 'session.created':
          console.log('Session created:', serverEvent.session)
          break

        case 'session.updated':
          console.log('Session updated:', serverEvent.session)
          break

        case 'input_audio_buffer.speech_started':
          console.log('User started speaking')
          break

        case 'input_audio_buffer.speech_stopped':
          console.log('User stopped speaking')
          break

        case 'response.created':
          console.log('Response created:', serverEvent.response)
          break

        case 'response.audio_transcript.delta':
          // Handle real-time transcript updates
          if (serverEvent.delta) {
            console.log('Audio transcript delta:', serverEvent.delta)
          }
          break

        case 'response.audio_transcript.done':
          // Handle completed transcript
          if (serverEvent.transcript) {
            setTranscript(prev => [...prev, {
              speaker: 'emma',
              text: serverEvent.transcript,
              timestamp: new Date()
            }])
          }
          break

        case 'response.done':
          console.log('Response completed:', serverEvent.response)
          break

        case 'error':
          console.error('Server error:', serverEvent)
          setConnectionStatus(`Server Error: ${serverEvent.error?.message || 'Unknown error'}`)
          break

        default:
          console.log('Unhandled server event:', serverEvent.type, serverEvent)
      }
    } catch (error) {
      console.error('Failed to parse server event:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      setConnectionStatus('Disconnecting...')

      // Close data channel
      if (dataChannelRef.current) {
        dataChannelRef.current.close()
        dataChannelRef.current = null
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
        peerConnectionRef.current = null
      }

      // Stop local media streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
        localStreamRef.current = null
      }

      // Clean up audio element
      if (audioRef.current && audioRef.current.srcObject) {
        const tracks = (audioRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
        audioRef.current.srcObject = null
      }

      // Notify backend about disconnect (optional, sessions auto-expire)
      if (session) {
        try {
          await fetch('/api/emma/realtime/disconnect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: session.sessionId })
          })
        } catch (error) {
          console.warn('Failed to notify backend about disconnect:', error)
        }
      }

      setIsConnected(false)
      setIsListening(false)
      setSession(null)
      setTranscript([])
      setConnectionStatus('Disconnected')

    } catch (error) {
      console.error('Failed to disconnect:', error)
      setConnectionStatus('Disconnected')
    }
  }

  const handleToggleListening = () => {
    // With WebRTC, listening is controlled by the audio track
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isListening
        setIsListening(!isListening)

        if (!isListening) {
          console.log('Microphone enabled - listening for speech')
        } else {
          console.log('Microphone disabled - not listening')
        }
      }
    }
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      handleDisconnect()
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Amazing Shader Background */}
      <ShaderBackground
        audioLevel={audioLevel}
        voiceActivity={voiceActivity}
        botSpeaking={botSpeaking}
        quality={0.8}
        intensity={isConnected ? 1.2 : 0.6}
        speed={isConnected ? 1.0 : 0.5}
        complexity={0.7}
      />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Emma AI Assistant</CardTitle>
              <CardDescription className="text-gray-300">
                Advanced OpenAI Realtime API integration with speech-to-speech architecture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cute Animated Shader Box */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Shader Animation Container */}
                  <div className="w-80 h-48 rounded-2xl overflow-hidden border-2 border-white/20 bg-black/20 backdrop-blur-sm">
                    <ShaderBackground
                      audioLevel={audioLevel}
                      voiceActivity={voiceActivity}
                      botSpeaking={botSpeaking}
                      quality={0.9}
                      intensity={isConnected ? (isListening ? 1.5 : 0.8) : 0.3}
                      speed={isConnected ? (botSpeaking ? 2.0 : 1.0) : 0.3}
                      complexity={0.8}
                    />
                  </div>

                  {/* Status Indicator Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${isConnected
                      ? (isListening ? 'bg-green-500/30 border-2 border-green-400 scale-110' : 'bg-blue-500/30 border-2 border-blue-400')
                      : 'bg-gray-500/30 border-2 border-gray-400'
                      } backdrop-blur-sm`}>
                      {isConnected ? (
                        isListening ? (
                          <Mic className={`w-8 h-8 text-white transition-all duration-300 ${botSpeaking ? 'scale-125' : ''}`} />
                        ) : (
                          <MicOff className="w-8 h-8 text-white" />
                        )
                      ) : (
                        <PhoneOff className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Cute pulsing ring when speaking */}
                  {(isListening || botSpeaking) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-24 h-24 rounded-full border-2 ${botSpeaking ? 'border-purple-400 animate-ping' : 'border-green-400 animate-pulse'
                        } opacity-60`}></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Compact Control Buttons */}
              <div className="flex justify-center gap-2">
                {!isConnected ? (
                  <Button
                    onClick={handleConnect}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleToggleListening}
                      className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                      size="sm"
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      onClick={handleToggleMute}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      size="sm"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      onClick={handleDisconnect}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                      size="sm"
                    >
                      <PhoneOff className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              <audio ref={audioRef} autoPlay muted={isMuted} />

              {transcript.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Conversation Transcript</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {transcript.map((entry, index) => (
                      <div key={index} className="text-gray-300 text-sm">
                        <span className={`font-semibold ${entry.speaker === 'user' ? 'text-blue-300' : 'text-green-300'}`}>
                          {entry.speaker === 'user' ? 'You' : 'Emma'}:
                        </span>{' '}
                        {entry.text}
                        <span className="text-gray-500 text-xs ml-2">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-300">
                <p className="mb-1">Status: <span className={`font-semibold ${isConnected ? 'text-green-300' : 'text-yellow-300'}`}>{connectionStatus}</span></p>
                {isConnected && session ? (
                  <p>Session ID: {session.sessionId} • Expires: {new Date(session.expiresAt * 1000).toLocaleTimeString()}</p>
                ) : (
                  <p>Click "Connect to Emma" to start voice conversation</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
