'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShaderBackground } from '@/components/ShaderBackground'
import { Mic, Zap, Brain, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [showTechnical, setShowTechnical] = useState(false)

  return (
    <div className="relative">
      {/* Beautiful Shader Background - Fixed Position */}
      <div className="fixed inset-0 z-0">
        <ShaderBackground 
          audioLevel={0.3}
          voiceActivity={0.2}
          botSpeaking={false}
          quality={0.8}
          intensity={0.6}
          speed={0.4}
          complexity={0.5}
        />
      </div>
      
      {/* Content Overlay - Scrollable */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="w-full max-w-4xl mx-auto space-y-8 text-center">
            
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold text-white mb-4">
                Meet <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Emma</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                Your AI companion that talks, listens, and understands you through beautiful voice conversations
              </p>
            </div>

            {/* Simple Explanation */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  What is Emma?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-300">
                <div className="text-center">
                  <Link href="/emma-advanced">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      🎤 Try Emma Now
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-400 mt-3">
                    Talk to your computer like a friend - no typing needed!
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4">
                    <Mic className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">You Speak</h3>
                    <p className="text-sm">Just talk naturally, like you would to a person</p>
                  </div>
                  <div className="text-center p-4">
                    <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Emma Thinks</h3>
                    <p className="text-sm">She understands and processes what you said</p>
                  </div>
                  <div className="text-center p-4">
                    <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">Emma Responds</h3>
                    <p className="text-sm">She talks back with her own voice instantly</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-white">Built with Cutting-Edge Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">AI</span>
                    </div>
                    <p className="text-white font-semibold">OpenAI</p>
                    <p className="text-xs text-gray-400">Realtime API</p>
                  </div>
                  <div className="p-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">⚡</span>
                    </div>
                    <p className="text-white font-semibold">WebRTC</p>
                    <p className="text-xs text-gray-400">Real-time Audio</p>
                  </div>
                  <div className="p-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">🎨</span>
                    </div>
                    <p className="text-white font-semibold">WebGL</p>
                    <p className="text-xs text-gray-400">Live Visuals</p>
                  </div>
                  <div className="p-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">⚛️</span>
                    </div>
                    <p className="text-white font-semibold">React</p>
                    <p className="text-xs text-gray-400">Next.js</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Details (Expandable) */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-3xl mx-auto">
              <CardHeader>
                <Button
                  variant="ghost"
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="w-full text-white hover:bg-white/10 flex items-center justify-between"
                >
                  <span className="text-lg font-semibold">More Technical Details</span>
                  {showTechnical ? <ChevronUp /> : <ChevronDown />}
                </Button>
              </CardHeader>
              {showTechnical && (
                <CardContent className="space-y-4 text-gray-300">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-white mb-2">🎙️ Audio Processing</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Real-time FFT frequency analysis</li>
                        <li>• Voice activity detection (VAD)</li>
                        <li>• Echo cancellation & noise suppression</li>
                        <li>• 24kHz audio sampling</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">🌐 Network Architecture</h4>
                      <ul className="text-sm space-y-1">
                        <li>• WebRTC peer-to-peer connection</li>
                        <li>• Ephemeral token security</li>
                        <li>• Sub-200ms latency</li>
                        <li>• Automatic reconnection</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">🎨 Visual Engine</h4>
                      <ul className="text-sm space-y-1">
                        <li>• WebGL shader programming</li>
                        <li>• Real-time audio visualization</li>
                        <li>• 60fps smooth animations</li>
                        <li>• Voice-reactive intensity</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">🤖 AI Integration</h4>
                      <ul className="text-sm space-y-1">
                        <li>• OpenAI GPT-4o Realtime model</li>
                        <li>• Speech-to-speech processing</li>
                        <li>• Context-aware conversations</li>
                        <li>• Multiple voice options</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-black/20 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">🔧 Implementation Highlights</h4>
                    <p className="text-sm">
                      This application showcases advanced web technologies working in harmony: 
                      WebRTC for low-latency audio streaming, Web Audio API for real-time frequency analysis, 
                      WebGL shaders for responsive visualizations, and OpenAI's cutting-edge Realtime API 
                      for natural speech-to-speech AI conversations.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* CTA Button */}
            <div className="pt-8">
              <Link href="/emma-advanced">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl px-8 py-6 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Talk to Emma Now
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-400">
            Made with 💖 by <span className="text-white font-semibold">Vibe Coder</span>
          </p>
        </div>


      </div>
    </div>
  )
}