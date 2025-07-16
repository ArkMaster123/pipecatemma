'use client'

import { useState, useEffect } from 'react'
import { VoiceInterface } from '@/components/VoiceInterface'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Zap, Mic, AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ShaderBackground } from '@/components/ShaderBackground'

export default function Home() {
  const [useOpenAI, setUseOpenAI] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Show content after animation loads
    const timer = setTimeout(() => setShowContent(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Shader Background */}
      <ShaderBackground />
      
      {/* Content Overlay */}
      <div className={`relative z-10 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-4 py-8 min-h-screen flex items-center">
          <div className="max-w-6xl mx-auto w-full space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Emma AI
                </span>
                <br />
                <span className="text-3xl md:text-4xl text-gray-300">
                  Voice Assistant
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Experience the future of voice interaction with cutting-edge AI technology
              </p>
            </div>

            {/* Technology Selector */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* OpenAI Realtime Card */}
              <div 
                className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  useOpenAI ? 'scale-105' : ''
                }`}
                onClick={() => setUseOpenAI(true)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${
                  useOpenAI ? 'opacity-100' : 'opacity-0'
                }`} />
                <Card className={`relative bg-white/10 backdrop-blur-md border-white/20 rounded-2xl overflow-hidden transition-all duration-300 ${
                  useOpenAI ? 'border-green-500/50' : 'border-white/20'
                }`}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-400 to-cyan-400 rounded-xl">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">OpenAI Realtime</CardTitle>
                        <CardDescription className="text-gray-300">Next-gen speech-to-speech</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-sm text-gray-300">~100ms latency</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-sm text-gray-300">Native emotion understanding</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        <span className="text-sm text-gray-300">Advanced interruption handling</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Link href="/emma" className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700">
                          Basic Mode
                        </Button>
                      </Link>
                      <Link href="/emma-advanced" className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          Advanced Mode
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pipecat Card */}
              <div 
                className={`relative group cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  !useOpenAI ? 'scale-105' : ''
                }`}
                onClick={() => setUseOpenAI(false)}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity duration-300 ${
                  !useOpenAI ? 'opacity-100' : 'opacity-0'
                }`} />
                <Card className={`relative bg-white/10 backdrop-blur-md border-white/20 rounded-2xl overflow-hidden transition-all duration-300 ${
                  !useOpenAI ? 'border-blue-500/50' : 'border-white/20'
                }`}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl">
                        <Mic className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white">Pipecat</CardTitle>
                        <CardDescription className="text-gray-300">Legacy framework</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-sm text-gray-300">~500ms latency</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-sm text-gray-300">Chained STT→LLM→TTS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-sm text-gray-300">Complex pipeline</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Link href="/" className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                          Use Pipecat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Setup Guide */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Quick Setup
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Get started in 30 seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">1. Add API Key</h3>
                    <div className="bg-gray-900/50 p-4 rounded-lg">
                      <p className="text-sm text-gray-300 mb-2">Create or edit <code className="text-green-400">.env.local</code>:</p>
                      <code className="text-xs bg-gray-800 text-white p-2 rounded block font-mono">
                        OPENAI_API_KEY=sk-your-openai-api-key-here
                      </code>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">2. Choose Mode</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>• <strong>Basic</strong>: Simple REST API integration</p>
                      <p>• <strong>Advanced</strong>: Full WebRTC speech-to-speech</p>
                      <p>• <strong>Pipecat</strong>: Legacy framework (fallback)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Comparison */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-center">Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-400">~100ms</div>
                    <div className="text-sm text-gray-300">OpenAI Latency</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400">~500ms</div>
                    <div className="text-sm text-gray-300">Pipecat Latency</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">Real-time</div>
                    <div className="text-sm text-gray-300">Conversation</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Selection Indicator */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <span className="text-sm text-gray-300">Current selection:</span>
                <span className={`font-semibold ${useOpenAI ? 'text-green-400' : 'text-blue-400'}`}>
                  {useOpenAI ? 'OpenAI Realtime API' : 'Pipecat Framework'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
