# Emma Voice Agent - OpenAI Realtime API Integration

This guide provides comprehensive documentation for implementing Emma, a voice agent powered by OpenAI's Realtime API using direct speech-to-speech architecture.

## 🎯 Architecture Overview

Emma uses **speech-to-speech (S2S)** architecture with the `gpt-4o-realtime-preview-2024-10-01` model, providing:
- **Low latency** interactions
- **Natural conversational flow** with emotion understanding
- **Real-time audio processing** without text transcription
- **WebRTC transport** for optimal browser performance

## 📁 Implementation Structure

### Basic Implementation (`/emma`)
- Simple REST API integration
- Basic connect/disconnect functionality
- Suitable for testing and simple use cases

### Advanced Implementation (`/emma-advanced`)
- Full WebRTC integration with OpenAI Realtime API
- Real-time audio streaming
- Advanced controls (mute, transcript)
- Production-ready architecture

## 🚀 Quick Start

### 1. Environment Setup
Add your OpenAI API key to `.env.local`:
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. Install Dependencies
```bash
npm install lucide-react @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### 3. Access Routes
- **Basic**: `http://localhost:3001/emma`
- **Advanced**: `http://localhost:3001/emma-advanced`

## 🔧 API Endpoints

### Basic Routes
- `POST /api/emma/connect` - Connect to OpenAI Realtime
- `POST /api/emma/start-listening` - Start voice input
- `POST /api/emma/stop-listening` - Stop voice input
- `POST /api/emma/disconnect` - Disconnect session

### Advanced Routes
- `POST /api/emma/realtime/session` - Create new realtime session
- `POST /api/emma/realtime/connect` - Establish WebRTC connection
- `POST /api/emma/realtime/disconnect` - Clean up session

## 🎤 Voice Agent Configuration

### Emma's Personality
```typescript
const emmaInstructions = `You are Emma, a friendly and helpful AI assistant. 
You provide assistance with various tasks while maintaining a warm, conversational tone. 
You can understand and respond to voice naturally, including handling interruptions 
and maintaining context throughout the conversation.`
```

### Voice Settings
- **Model**: `gpt-4o-realtime-preview-2024-10-01`
- **Voice**: `alloy` (clear, natural)
- **Transport**: WebRTC (low latency)

## 🛠️ Technical Features

### Real-time Audio Processing
- **Input**: Microphone access with noise suppression
- **Output**: Direct audio streaming to browser
- **Latency**: <100ms typical response time

### Advanced Controls
- **Connect/Disconnect**: Session management
- **Start/Stop Listening**: Voice input control
- **Mute/Unmute**: Audio output control
- **Transcript Display**: Real-time conversation history

### Error Handling
- Network connection recovery
- Microphone permission handling
- Session timeout management
- Graceful degradation

## 🔐 Security Considerations

### API Key Management
- Never expose API keys in client-side code
- Use environment variables for configuration
- Implement rate limiting for production use

### Privacy
- Audio data is processed in real-time only
- No persistent storage of voice data
- Secure WebRTC connections

## 📊 Performance Optimization

### WebRTC Configuration
```javascript
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
})
```

### Audio Settings
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
})
```

## 🧪 Testing

### Manual Testing
1. Navigate to `/emma-advanced`
2. Click "Connect to Emma"
3. Allow microphone access
4. Start speaking naturally
5. Test interruption handling
6. Verify transcript accuracy

### Automated Testing
- Unit tests for API endpoints
- Integration tests for WebRTC
- Load testing for concurrent users

## 🚀 Production Deployment

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional
NEXT_PUBLIC_EMMA_VOICE=alloy
NEXT_PUBLIC_EMMA_MODEL=gpt-4o-realtime-preview-2024-10-01
```

### Performance Monitoring
- Track connection success rates
- Monitor audio quality metrics
- Measure response latency
- Log error rates

## 🔧 Customization

### Changing Voice
Modify the `voice` parameter in session creation:
```typescript
voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
```

### Custom Instructions
Update the `instructions` parameter to change Emma's personality:
```typescript
instructions: `You are [CUSTOM PERSONALITY]. [CUSTOM BEHAVIOR]...`
```

### Adding Tools
Extend functionality with custom tools:
```typescript
tools: [
  {
    type: "function",
    function: {
      name: "customTool",
      description: "Custom functionality",
      parameters: { /* schema */ }
    }
  }
]
```

## 📞 Support & Troubleshooting

### Common Issues
1. **Microphone not working**: Check browser permissions
2. **Connection failed**: Verify API key and network
3. **No audio output**: Check speaker settings
4. **High latency**: Test network connection

### Debug Mode
Enable detailed logging by setting:
```javascript
console.log('Connection state:', pc.connectionState)
```

## 🔄 Migration from Pipecat

This implementation uses **direct OpenAI Realtime API** instead of Pipecat, providing:
- Lower latency
- More control over audio processing
- Direct access to OpenAI features
- Simpler architecture for basic use cases

## 📈 Future Enhancements

- Multi-language support
- Custom voice training
- Advanced conversation states
- Integration with external services
- Real-time sentiment analysis

---

**Note**: This implementation follows OpenAI's recommended speech-to-speech architecture for optimal voice agent performance.
