import React from 'react';

/**
 * Slider - Reusable range slider component
 * Used for selecting a value within a range (e.g., mood/stress levels)
 */

export interface SliderOption {
  value: number;
  label: string;
  emoji?: string;
}

export interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  showLabels?: boolean;
  labels?: SliderOption[];
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  disabled = false,
  className = '',
  label,
  showLabels = true,
  labels,
}) => {
  const defaultLabels: SliderOption[] = labels || Array.from(
    { length: max - min + 1 },
    (_, i) => ({
      value: min + i,
      label: `Level ${min + i}`,
    })
  );

  const currentLabel = defaultLabels.find((l) => l.value === value);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-3">
          {label}
        </label>
      )}

      {/* Current Value Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {currentLabel?.emoji && (
            <span className="text-2xl">{currentLabel.emoji}</span>
          )}
          <span className="text-lg font-semibold text-gray-900">
            {currentLabel?.label}
          </span>
        </div>
        <span className="text-sm text-gray-500">{value}</span>
      </div>

      {/* Slider Input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`
          w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
          accent-[#2D3643]
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          background: `linear-gradient(to right, #2D3643 0%, #2D3643 ${
            ((value - min) / (max - min)) * 100
          }%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`,
        }}
      />

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between mt-4 gap-2">
          {defaultLabels.map((labelItem) => (
            <div
              key={labelItem.value}
              className={`
                flex-1 text-center p-2 rounded-lg transition-all duration-200
                ${
                  value === labelItem.value
                    ? 'bg-blue-100 border-2 border-[#2D3643]'
                    : 'bg-gray-100 border-2 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {labelItem.emoji && (
                <div className="text-xl mb-1">{labelItem.emoji}</div>
              )}
              <button
                type="button"
                onClick={() => onChange(labelItem.value)}
                disabled={disabled}
                className={`w-full text-xs font-medium ${
                  value === labelItem.value ? 'text-gray-900' : 'text-gray-600'
                } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {labelItem.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;
