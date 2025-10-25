import React from 'react';

/**
 * RadioGroup - Reusable radio button group component
 * Used for single selection from multiple options
 */

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  disabled = false,
  className = '',
  direction = 'vertical',
}) => {
  const containerClass = direction === 'horizontal' 
    ? 'flex flex-wrap gap-4' 
    : 'flex flex-col gap-3';

  return (
    <div className={`${containerClass} ${className}`}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-center gap-3 p-3 rounded-lg cursor-pointer
            transition-all duration-200 border-2
            ${
              value === option.value
                ? 'border-[#2D3643] bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-4 h-4 cursor-pointer accent-[#2D3643]"
          />
          <div className="flex-1">
            {option.icon && <span className="mr-2">{option.icon}</span>}
            <span className="font-medium text-gray-900">{option.label}</span>
            {option.description && (
              <p className="text-sm text-gray-500 mt-1">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;
