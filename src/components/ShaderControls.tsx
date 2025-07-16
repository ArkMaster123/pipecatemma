'use client';

import { useState } from 'react';

interface ShaderControlsProps {
  quality: number;
  intensity: number;
  speed: number;
  complexity: number;
  onQualityChange: (value: number) => void;
  onIntensityChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
  onComplexityChange: (value: number) => void;
}

export const ShaderControls = ({
  quality,
  intensity,
  speed,
  complexity,
  onQualityChange,
  onIntensityChange,
  onSpeedChange,
  onComplexityChange,
}: ShaderControlsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const SliderControl = ({ 
    label, 
    value, 
    min, 
    max, 
    step, 
    onChange,
    description 
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    description: string;
  }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-white/90">{label}</label>
        <span className="text-xs text-white/60">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #10b981 0%, #10b981 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) 100%)`
        }}
      />
      <p className="text-xs text-white/50 mt-1">{description}</p>
    </div>
  );

  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-black/40 backdrop-blur-md rounded-lg p-3 border border-white/20 hover:bg-black/60 transition-all duration-200 mb-2"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-white">Shader Controls</span>
          <span className="text-white/60 text-xs">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-black/40 backdrop-blur-md rounded-lg p-4 border border-white/20 w-64 animate-in slide-in-from-right duration-200">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">⚡</span>
            Performance Controls
          </h3>

          <SliderControl
            label="Quality"
            value={quality}
            min={0.1}
            max={1.0}
            step={0.1}
            onChange={onQualityChange}
            description="Rendering quality (20-60 steps)"
          />

          <SliderControl
            label="Intensity"
            value={intensity}
            min={0.1}
            max={2.0}
            step={0.1}
            onChange={onIntensityChange}
            description="Effect brightness and reactivity"
          />

          <SliderControl
            label="Speed"
            value={speed}
            min={0.1}
            max={2.0}
            step={0.1}
            onChange={onSpeedChange}
            description="Animation speed multiplier"
          />

          <SliderControl
            label="Complexity"
            value={complexity}
            min={0.3}
            max={1.0}
            step={0.1}
            onChange={onComplexityChange}
            description="Detail level (3-8 iterations)"
          />

          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Performance Tips:</h4>
            <ul className="text-xs text-white/70 space-y-1">
              <li>• Lower quality for better FPS</li>
              <li>• Reduce complexity on mobile</li>
              <li>• Adjust intensity for audio reactivity</li>
            </ul>
          </div>

          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={() => {
                onQualityChange(0.5);
                onIntensityChange(1.0);
                onSpeedChange(1.0);
                onComplexityChange(0.5);
              }}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Reset to Performance
            </button>
            <button
              onClick={() => {
                onQualityChange(0.8);
                onIntensityChange(1.5);
                onSpeedChange(1.2);
                onComplexityChange(0.8);
              }}
              className="text-xs text-white/60 hover:text-white transition-colors"
            >
              Max Quality
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};