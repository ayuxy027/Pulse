import React, { useState } from 'react';
import { WandSparkles } from 'lucide-react';
import { enhancePrompt } from '../../services/promptEnhancementService';

interface PromptEnhancerProps {
    inputValue: string;
    onEnhancementComplete: (enhancedPrompt: string) => void;
    disabled?: boolean;
}

/**
 * Simple prompt enhancement component
 */
const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
    inputValue,
    onEnhancementComplete,
    disabled = false,
}) => {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEnhancement = async () => {
        if (!inputValue.trim() || isEnhancing || disabled) {
            return;
        }

        setIsEnhancing(true);
        setError(null);

        try {
            const result = await enhancePrompt(inputValue);

            if (result.success && result.enhancedPrompt) {
                onEnhancementComplete(result.enhancedPrompt);
            } else {
                setError(result.error || 'Enhancement failed');
            }
        } catch (err) {
            console.error('Enhancement error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsEnhancing(false);
        }
    };

    const isDisabled = disabled || isEnhancing || !inputValue.trim();

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleEnhancement}
                disabled={isDisabled}
                aria-label="Enhance prompt with AI"
                className={`
          flex items-center justify-center
          w-5 h-5 rounded-full
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${isEnhancing
                        ? 'text-blue-500 animate-pulse'
                        : 'text-gray-400 hover:text-gray-600 hover:scale-105'
                    }
        `}
                title="Enhance prompt"
            >
                <WandSparkles
                    size={20}
                    className=""
                />
            </button>

            {error && (
                <div
                    role="alert"
                    className="
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
            px-3 py-2 bg-red-100 border border-red-300 rounded-lg
            text-red-700 text-sm whitespace-nowrap
            shadow-lg z-10
          "
                >
                    <div className="flex items-center gap-2">
                        <span className="text-red-500">⚠</span>
                        {error}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-300"></div>
                </div>
            )}
        </div>
    );
};

export default PromptEnhancer;

