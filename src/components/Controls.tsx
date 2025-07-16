'use client';

interface ControlsProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Controls = ({ isConnected, onConnect, onDisconnect }: ControlsProps) => {
  return (
    <div className="flex justify-center space-x-4">
      {!isConnected ? (
        <button
          onClick={onConnect}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Connect to Emma
        </button>
      ) : (
        <button
          onClick={onDisconnect}
          className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Disconnect
        </button>
      )}
    </div>
  );
};
