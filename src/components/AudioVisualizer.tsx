'use client';

interface AudioVisualizerProps {
  isConnected: boolean;
  isBotSpeaking: boolean;
  audioLevel: number;
}

export const AudioVisualizer = ({ 
  isConnected, 
  isBotSpeaking, 
  audioLevel 
}: AudioVisualizerProps) => {
  const getStatusColor = () => {
    if (!isConnected) return 'bg-gray-500';
    if (isBotSpeaking) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (isBotSpeaking) return 'Emma is speaking...';
    return 'Listening...';
  };

  return (
    <div className="flex flex-col items-center space-y-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className={`w-4 h-4 rounded-full ${getStatusColor()} animate-pulse`} />
        <span className="text-white text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {isConnected && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-150"
              style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Quiet</span>
            <span>Loud</span>
          </div>
        </div>
      )}
    </div>
  );
};
