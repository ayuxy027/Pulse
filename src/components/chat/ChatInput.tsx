import React, { useState } from 'react';
import { Plus, AtSign, ArrowUpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../../services/groqClient';
import PromptEnhancer from './PromptEnhancer';

/**
 * ChatInput - Advanced input component with @ tagging, file attachment, and send functionality
 */
const ChatInput: React.FC = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() && !isLoading && !isEnhancing) {
      handleAISubmit();
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && !isLoading && !isEnhancing) {
      handleAISubmit();
    }
  };

  const handleAISubmit = async () => {
    setIsLoading(true);

    try {
      // Start AI generation in background
      const result = await sendMessage(inputValue, (chunk) => {
        // Handle streaming response
        console.log('AI Response:', chunk);
      });

      if (result.success) {
        // Navigate to chats page after successful AI generation
        navigate('/chats');
      }
    } catch {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhancementComplete = (enhancedPrompt: string) => {
    setInputValue(enhancedPrompt);
    setIsEnhancing(false);
  };

  // Display input text
  const displayText = inputValue;



  return (
    <div
      style={{
        width: '588px',
        height: '92px',
        gap: '18px',
        opacity: 1,
        borderRadius: '12px', // corner radius/xl
        borderWidth: '1px',
        padding: '16px', // spacing/md
        background: 'var(--background-neutral-soft-surface, #F9FAFB)',
        border: '1px solid var(--border-neutral-subtle, #1B38601F)',
        boxShadow: '0px 4px 6px -2px var(--transparentdark6), 0px 10px 15px -3px var(--transparentdark12)',
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Input Area */}
        <input
          type="text"
          value={displayText}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading || isEnhancing}
          placeholder={
            isLoading
              ? "Processing..."
              : isEnhancing
                ? "Enhancing prompt..."
                : "How can I help you today"
          }
          className="bg-transparent outline-none w-full"
          style={{
            width: '556px',
            height: '22px',
            opacity: (isLoading || isEnhancing) ? 0.6 : 1,
            fontFamily: 'Inter',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '14px',
            lineHeight: '22px',
            letterSpacing: '-0.2px',
            color: (isLoading || isEnhancing) ? '#6B7280' : '#8897AE',
          }}
        />





        {/* Icons Section */}
        <div
          className="flex justify-between items-center"
          style={{
            width: '556px',
            height: '20px',
            justifyContent: 'space-between',
            opacity: 1,
          }}
        >
          <div className="flex items-center gap-3">
            <Plus
              size={16}
              className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
            />
            <AtSign
              size={16}
              className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <PromptEnhancer
              inputValue={inputValue}
              onEnhancementComplete={handleEnhancementComplete}
              disabled={isLoading || isEnhancing}
            />
            {(isLoading || isEnhancing) ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <ArrowUpCircle
                size={20}
                className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                onClick={handleSend}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput; 