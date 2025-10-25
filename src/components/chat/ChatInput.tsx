import React, { useState, useRef, useEffect } from 'react';
import { Send, AtSign, Image as ImageIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: string[]) => void;
  onAttachData: (dataType: string) => void;
  onAttachImage: (file: File) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onAttachData,
  onAttachImage,
  disabled
}) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle @ mentions
  useEffect(() => {
    const words = input.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const query = lastWord.substring(1).toLowerCase();
      const allSuggestions = [
        '@profile', '@health', '@today', '@meals', '@habits', '@reminders'
      ];
      setSuggestions(
        allSuggestions.filter(s => s.toLowerCase().includes(query))
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (suggestions[suggestionIndex]) {
          selectSuggestion(suggestions[suggestionIndex]);
        }
      }
    }
  };

  const selectSuggestion = (suggestion: string) => {
    const words = input.split(' ');
    words[words.length - 1] = suggestion;
    setInput(words.join(' ') + ' ');
    setShowSuggestions(false);
    setSuggestionIndex(0);

    // Trigger the data attachment
    const dataType = suggestion.substring(1);
    onAttachData(dataType);
  };

  const handleSendMessage = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onAttachImage(files[0]);
    }
    e.target.value = '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="p-4">
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${index === suggestionIndex ? 'bg-blue-50' : ''
                  }`}
                onMouseEnter={() => setSuggestionIndex(index)}
                onClick={() => selectSuggestion(suggestion)}
              >
                <span className="text-sm font-medium text-gray-900">{suggestion}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Upload meal image"
            disabled={disabled}
          >
            <ImageIcon size={20} />
          </button>

          {/* At Icon for @ mentions */}
          <button
            onClick={() => {
              setInput(prev => prev + '@');
              setTimeout(() => {
                const textarea = textareaRef.current;
                if (textarea) {
                  textarea.focus();
                  textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
                }
              }, 0);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Attach user data with @"
            disabled={disabled}
          >
            <AtSign size={20} />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your health, diet, or attach data with @..."
              className="w-full min-h-[48px] max-h-32 p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              rows={1}
              disabled={disabled}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || disabled}
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Hidden file input for image uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ChatInput;