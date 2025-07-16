'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react'

interface RealtimeSession {
  sessionId: string;
  expiresAt: number;
}

export default function EmmaAdvancedPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [session, setSession] = useState<RealtimeSession | null>(null)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/emma/realtime/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSession(data)
        await initializeRealtimeConnection(data)
        setIsConnected(true)
      } else {
        throw new Error(data.error || 'Failed to create session')
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const initializeRealtimeConnection = async (sessionData: RealtimeSession) => {
    try {
      // Get user media for microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      // Initialize WebRTC connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      // Add audio track
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Create offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Connect to OpenAI Realtime API
      const response = await fetch('/api/emma/realtime/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          sdp: offer.sdp,
          type: offer.type
        })
      })

      const { sdp, type } = await response.json()
      await pc.setRemoteDescription(new RTCSessionDescription({ sdp, type }))

      // Handle incoming audio
      pc.ontrack = (event) => {
        if (audioRef.current) {
          audioRef.current.srcObject = event.streams[0]
          audioRef.current.play()
        }
      }

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState)
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          handleDisconnect()
        }
      }

    } catch (error) {
      console.error('Failed to initialize realtime connection:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      if (session) {
        await fetch('/api/emma/realtime/disconnect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: session.sessionId })
        })
      }

      // Clean up media streams
      if (audioRef.current && audioRef.current.srcObject) {
        const tracks = (audioRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }

      setIsConnected(false)
      setIsListening(false)
      setSession(null)
      setTranscript([])
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  const handleToggleListening = () => {
    if (isListening) {
      // Stop listening
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      setIsListening(false)
    } else {
      // Start listening
      startListening()
      setIsListening(true)
    }
  }

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(event.data)
        }
      }

      mediaRecorder.start(100) // Send data every 100ms
      mediaRecorderRef.current = mediaRecorder
    } catch (error) {
      console.error('Failed to start listening:', error)
    }
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Emma AI Assistant</CardTitle>
            <CardDescription className="text-gray-300">
              Advanced OpenAI Realtime API integration with speech-to-speech architecture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                isConnected ? 'bg-green-500/20 border-4 border-green-500' : 'bg-gray-500/20 border-4 border-gray-500'
              }`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isConnected ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {isConnected ? (
                    <Phone className="w-12 h-12 text-white" />
                  ) : (
                    <PhoneOff className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {!isConnected ? (
                <Button 
                  onClick={handleConnect}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Connect to Emma
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleToggleListening}
                    className={`${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    size="lg"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Listening
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleToggleMute}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    size="lg"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Unmute
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Mute
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={handleDisconnect}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                    size="lg"
                  >
                    <PhoneOff className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </>
              )}
            </div>

            <audio ref={audioRef} autoPlay muted={isMuted} />

            {transcript.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Conversation Transcript</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {transcript.map((line, index) => (
                    <div key={index} className="text-gray-300 text-sm">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center text-sm text-gray-300">
              {isConnected ? (
                <p>Connected to OpenAI Realtime API • Session ID: {session?.sessionId}</p>
              ) : (
                <p>Click "Connect to Emma" to start voice conversation</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
