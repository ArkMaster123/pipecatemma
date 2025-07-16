import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emma - AI Home Care Assistant",
  description: "Your compassionate voice assistant for home care and health monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script id="phosphor-shader" type="x-shader/x-fragment">
          {`
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
          `}
        </script>
      </head>
      <body className="bg-black text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
