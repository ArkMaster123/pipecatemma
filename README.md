# Emma - AI Home Care Voice Assistant

A compassionate voice AI agent for home care using Pipecat's JavaScript SDK with OpenAI Realtime API and beautiful shader-based visual effects.

## 🎯 Features

- **Voice-to-voice conversation** with OpenAI Realtime API
- **Compassionate AI assistant** ("Emma") designed for elderly care
- **Real-time audio visualization** with phosphor shader effects
- **Medication reminders** via function calling
- **Emergency contact system** for safety
- **Health check-ins** with mood and pain tracking
- **Responsive design** optimized for tablets and mobile devices

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Add your OpenAI API key to `.env.local`:
```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here
```

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to start using Emma!

## 🎨 Visual Features

- **Phosphor shader background** that reacts to audio levels
- **Real-time audio visualization** showing voice activity
- **Smooth animations** and transitions
- **Dark theme** optimized for accessibility
- **Responsive design** that works on all devices

## 🔧 Technical Stack

- **Frontend**: Next.js 15 with TypeScript
- **Voice AI**: Pipecat + OpenAI Realtime API
- **Visual Effects**: Three.js + WebGL shaders
- **Styling**: Tailwind CSS
- **Audio Processing**: Real-time audio level detection

## 📱 Usage

1. **Connect**: Click "Connect to Emma" to start the voice session
2. **Speak**: Talk naturally - Emma will respond with warmth and patience
3. **Features**: Ask about:
   - Medication reminders
   - Health check-ins
   - Emergency contacts
   - Daily conversation and companionship

## 🏗️ Architecture

```
src/
├── components/
│   ├── VoiceInterface.tsx      # Main interface component
│   ├── ShaderBackground.tsx    # WebGL shader renderer
│   ├── AudioVisualizer.tsx     # Real-time audio display
│   └── Controls.tsx           # Connection controls
├── hooks/
│   ├── usePipecatClient.ts    # Pipecat client management
│   └── useShaderRenderer.ts   # Shader rendering logic
├── types/
│   └── pipecat.d.ts          # TypeScript definitions
```

## 🔐 Security Notes

- **Development**: Uses client-side API keys for rapid prototyping
- **Production**: Should implement server-side API key management
- **Privacy**: All conversations are processed through OpenAI's secure API

## 🚀 Production Deployment

For production deployment:

1. **Server-side API keys**: Move API keys to server environment
2. **Rate limiting**: Implement proper rate limiting
3. **Authentication**: Add user authentication system
4. **Monitoring**: Add error tracking and analytics
5. **Scaling**: Consider DailyTransport for production scaling

## 🛠️ Development Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_OPENAI_API_KEY` | OpenAI API key for Realtime API | Yes |
| `NEXT_PUBLIC_USE_PRODUCTION` | Set to 'true' for production mode | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own AI home care solutions!

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section below
2. Open an issue on GitHub
3. Contact the development team

## 🔍 Troubleshooting

### Common Issues

**"Cannot connect to Emma"**
- Ensure your OpenAI API key is valid and has Realtime API access
- Check browser console for detailed error messages
- Verify microphone permissions are granted

**"Shader not displaying"**
- Ensure WebGL is supported in your browser
- Check for any browser console errors
- Try refreshing the page

**"No audio response"**
- Check microphone permissions
- Ensure audio output device is working
- Verify network connectivity

### Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

### Mobile Support

- **iOS Safari**: Full support
- **Android Chrome**: Full support
- **Mobile Firefox**: Full support
