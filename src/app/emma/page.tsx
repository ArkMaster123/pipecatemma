'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'

export default function EmmaPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/emma/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setIsConnected(true)
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/emma/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setIsConnected(false)
        setIsListening(false)
      }
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  const handleToggleListening = async () => {
    try {
      const endpoint = isListening ? '/api/emma/stop-listening' : '/api/emma/start-listening'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setIsListening(!isListening)
      }
    } catch (error) {
      console.error('Failed to toggle listening:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Emma AI Assistant</CardTitle>
          <CardDescription className="text-gray-300">
            Connect to OpenAI Realtime API for voice conversations
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

          <div className="space-y-4">
            {!isConnected ? (
              <Button 
                onClick={handleConnect}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Phone className="w-4 h-4 mr-2" />
                Connect to Emma
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleToggleListening}
                  className={`w-full ${isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
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
                  onClick={handleDisconnect}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  size="lg"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </>
            )}
          </div>

          <div className="text-center text-sm text-gray-300">
            {isConnected ? (
              <p>Connected to OpenAI Realtime API</p>
            ) : (
              <p>Click "Connect to Emma" to start voice conversation</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
