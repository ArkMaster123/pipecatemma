# 🎙️ Emma AI Voice Assistant

A cutting-edge **speech-to-speech AI assistant** powered by OpenAI's Realtime API with stunning real-time shader visualizations that respond to voice activity.

![Emma AI Demo](https://img.shields.io/badge/Status-Live-brightgreen) ![OpenAI Realtime](https://img.shields.io/badge/OpenAI-Realtime%20API-blue) ![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-orange)

## ✨ Features

### 🗣️ **Real-Time Voice Interaction**
- **Speech-to-Speech**: Direct voice conversation with Emma AI
- **Low Latency**: WebRTC connection for minimal delay
- **Voice Activity Detection**: Automatic speech detection with server VAD
- **Natural Conversations**: Handles interruptions and maintains context

### 🎨 **Stunning Visual Experience**
- **Real-Time Shader Animations**: Beautiful WebGL shaders that respond to voice
- **Voice-Reactive Visuals**: Animations change based on:
  - Your voice volume and frequency
  - Emma's response activity
  - Connection status
- **Smooth Transitions**: Fluid animations with exponential smoothing
- **Dynamic Intensity**: Visual feedback adapts to conversation flow

### 🔧 **Advanced Audio Processing**
- **Frequency Analysis**: Real-time FFT analysis of audio streams
- **Voice Detection**: Smart algorithms to detect human speech patterns
- **Dual Audio Monitoring**: Analyzes both input (your voice) and output (Emma's voice)
- **Audio Quality Controls**: Echo cancellation, noise suppression, auto-gain

### 🛡️ **Enterprise-Grade Security**
- **Ephemeral Tokens**: Secure session management with auto-expiring keys
- **Server-Side API Keys**: Your OpenAI keys never leave the server
- **Robust Error Handling**: Comprehensive error recovery and user feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API key with Realtime API access
- Modern web browser with WebRTC support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd emma-voice-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your OpenAI API key to `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000/emma-advanced`

## 🎮 How to Use

### 🔌 **Connect to Emma**
1. Click the **"Connect"** button
2. Allow microphone permissions when prompted
3. Wait for the connection status to show "Connected"

### 🎤 **Start Talking**
- Emma automatically listens when connected
- The shader box will animate based on your voice
- Green pulsing ring indicates you're speaking
- Purple pulsing ring shows Emma is responding

### 🎛️ **Controls**
- **🎤 Mic Button**: Toggle microphone on/off
- **🔊 Volume Button**: Mute/unmute Emma's responses  
- **📞 Disconnect Button**: End the session

### 📝 **View Transcript**
- Real-time conversation transcript appears below
- Shows both your words and Emma's responses
- Timestamps for each interaction

## 🏗️ Architecture

### 🔄 **Connection Flow**
```
Frontend → Backend API → OpenAI Realtime API
    ↓         ↓              ↓
WebRTC ← Ephemeral Token ← Session Creation
```

### 🎵 **Audio Processing Pipeline**
```
Microphone → Web Audio API → Frequency Analysis → Shader Animation
                ↓
            WebRTC Stream → OpenAI Realtime API
                                    ↓
Speaker ← Audio Element ← WebRTC Response ← Emma's Voice
    ↓
Shader Animation ← Output Analysis ← Audio Monitoring
```

### 📁 **Project Structure**
```
src/
├── app/
│   ├── api/emma/realtime/          # Backend API endpoints
│   │   ├── session/                # Session management
│   │   ├── connect/                # WebRTC connection
│   │   └── disconnect/             # Session cleanup
│   └── emma-advanced/              # Main voice interface
├── components/
│   ├── ui/                         # UI components
│   └── ShaderBackground.tsx        # WebGL shader renderer
├── types/                          # TypeScript definitions
└── hooks/                          # Custom React hooks
```

## 🔧 Technical Details

### 🌐 **WebRTC Implementation**
- Direct peer connection to OpenAI's Realtime API
- Automatic ICE candidate handling
- Data channels for event communication
- Media stream management for audio I/O

### 🎨 **Shader System**
- WebGL-based real-time rendering
- Responds to audio frequency data
- Multiple animation states and transitions
- Optimized for 60fps performance

### 📊 **Audio Analysis**
- **FFT Size**: 256 bins for frequency analysis
- **Smoothing**: 0.8 time constant for stable visuals
- **Voice Detection**: Frequency range analysis (85Hz-255Hz)
- **Real-time Processing**: 60fps analysis loop

### 🔐 **Security Features**
- Ephemeral API tokens (1-minute expiration)
- Server-side API key management
- Input validation and sanitization
- Comprehensive error handling

## 🎯 **API Endpoints**

### `POST /api/emma/realtime/session`
Creates a new voice session with ephemeral token
- **Input**: Voice settings (voice, instructions, temperature)
- **Output**: Session ID, expiration, client secret

### `POST /api/emma/realtime/connect`
Establishes WebRTC connection (fallback endpoint)
- **Input**: Session ID, SDP offer
- **Output**: SDP answer

### `POST /api/emma/realtime/disconnect`
Cleanly terminates voice session
- **Input**: Session ID
- **Output**: Success confirmation

## 🛠️ **Configuration**

### 🎵 **Voice Settings**
```typescript
{
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
  instructions: string,
  temperature: 0.0 - 2.0
}
```

### 🎨 **Shader Parameters**
```typescript
{
  audioLevel: 0.0 - 1.0,      // Overall volume
  voiceActivity: 0.0 - 1.0,   // Voice-specific activity
  botSpeaking: boolean,        // Emma response state
  intensity: 0.3 - 1.5,       // Animation intensity
  speed: 0.3 - 2.0,           // Animation speed
  complexity: 0.0 - 1.0       // Visual complexity
}
```

## 🐛 **Troubleshooting**

### Common Issues

**"Invalid or missing API key"**
- Ensure your OpenAI API key is set in `.env.local`
- Verify your key has Realtime API access

**"Microphone permission denied"**
- Allow microphone access in your browser
- Check browser security settings

**"WebRTC connection failed"**
- Ensure stable internet connection
- Try refreshing the page
- Check browser WebRTC support

**"Session creation failed"**
- Verify OpenAI API key validity
- Check OpenAI service status
- Review server console logs

## 🔮 **Future Enhancements**

- [ ] Multiple voice profiles
- [ ] Conversation history persistence
- [ ] Custom shader themes
- [ ] Mobile app support
- [ ] Multi-language support
- [ ] Voice training capabilities

## 🤝 **Contributing**

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Pull request process
- Issue reporting
- Feature requests

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 **Acknowledgments**

- OpenAI for the incredible Realtime API
- WebRTC community for real-time communication standards
- Three.js community for WebGL inspiration
- React and Next.js teams for the amazing frameworks

---

**Made with 💖 by Vibe Coder**

*Experience the future of voice AI interaction with Emma - where technology meets artistry in perfect harmony.*