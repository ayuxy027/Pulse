import React from 'react';
import { X } from 'lucide-react';

/**
 * MultiSelect - Reusable multi-checkbox component
 * Used for selecting multiple options
 */

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface MultiSelectProps {
  name: string;
  options: MultiSelectOption[];
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  className?: string;
  maxSelectable?: number;
  showSelectedTags?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  name,
  options,
  values,
  onChange,
  disabled = false,
  className = '',
  maxSelectable,
  showSelectedTags = true,
}) => {

  const handleToggle = (value: string) => {
    if (disabled) return;

    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      if (maxSelectable && values.length >= maxSelectable) {
        return;
      }
      onChange([...values, value]);
    }
  };

  const handleRemoveTag = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  const selectedLabels = options
    .filter((opt) => values.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div className={`${className}`}>
      {/* Selected Tags Display */}
      {showSelectedTags && values.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedLabels.map((label, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-medium"
            >
              {label}
              <button
                onClick={() => handleRemoveTag(values[idx])}
                className="hover:text-blue-700"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Checkbox Options */}
      <div className="flex flex-col gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`
              flex items-start gap-3 p-3 rounded-lg cursor-pointer
              transition-all duration-200 border-2
              ${
                values.includes(option.value)
                  ? 'border-[#2D3643] bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }
              ${disabled || (maxSelectable && values.length >= maxSelectable && !values.includes(option.value))
                ? 'opacity-50 cursor-not-allowed'
                : ''}
            `}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={values.includes(option.value)}
              onChange={(e) => handleToggle(e.target.value)}
              disabled={
                disabled || (maxSelectable && values.length >= maxSelectable && !values.includes(option.value)) || false
              }
              className="w-4 h-4 mt-1 cursor-pointer accent-[#2D3643]"
            />
            <div className="flex-1">
              {option.icon && <span className="mr-2 inline-block">{option.icon}</span>}
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description && (
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {maxSelectable && (
        <p className="text-xs text-gray-500 mt-2">
          {values.length} / {maxSelectable} selected
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
