import React, { useState, useRef, useEffect } from 'react';
import { AtSign, ArrowUpCircle } from 'lucide-react';
import PromptEnhancer from './PromptEnhancer';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    onAttachData: (dataType: string) => void;
    disabled?: boolean;
    showWrapper?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    onAttachData,
    disabled,
    showWrapper = true
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Handle @ mentions - Use useRef to store suggestions
    const allSuggestions = useRef([
        'profile', 'health', 'today', 'meals', 'habits', 'reminders'
    ]);

    useEffect(() => {
        const words = inputValue.split(' ');
        const lastWord = words[words.length - 1];

        if (lastWord.startsWith('@')) {
            const query = lastWord.substring(1).toLowerCase();
            const filteredSuggestions = allSuggestions.current
                .filter(s => s.toLowerCase().includes(query))
                .map(s => `@${s}`);

            setSuggestions(filteredSuggestions);
            setShowSuggestions(filteredSuggestions.length > 0);
        } else {
            setShowSuggestions(false);
        }
    }, [inputValue]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const selectSuggestion = (suggestion: string) => {
        const words = inputValue.split(' ');
        words[words.length - 1] = suggestion;
        setInputValue(words.join(' ') + ' ');
        setShowSuggestions(false);
        setSuggestionIndex(0);

        // Trigger the data attachment
        const dataType = suggestion.substring(1);
        onAttachData(dataType);
    };

    const handleSend = () => {
        if (inputValue.trim() && !disabled && !isEnhancing) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleEnhancementComplete = (enhancedPrompt: string) => {
        setInputValue(enhancedPrompt);
        setIsEnhancing(false);
    };

    const inputContent = (
        <>
            <div className="relative w-full flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white shadow-sm p-3">
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto w-full">
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

                {/* Input Area */}
                <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        disabled || isEnhancing
                            ? "Processing..."
                            : isEnhancing
                                ? "Enhancing prompt..."
                                : "How can I help you today?"
                    }
                    className="bg-transparent outline-none w-full resize-none text-gray-800 placeholder-gray-400 text-sm font-normal leading-tight"
                    rows={1}
                    style={{ minHeight: '22px', maxHeight: '100px' }}
                    disabled={disabled || isEnhancing}
                    aria-label="Chat input"
                    aria-describedby="chat-input-description"
                />

                {/* Icons Section */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {/* AtSign for @mentions */}
                        <button
                            onClick={() => {
                                setInputValue(prev => prev + '@');
                                setTimeout(() => {
                                    const textarea = textareaRef.current;
                                    if (textarea) {
                                        textarea.focus();
                                        textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
                                    }
                                }, 0);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            title="Attach user data with @"
                            disabled={disabled || isEnhancing}
                        >
                            <AtSign size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <PromptEnhancer
                            inputValue={inputValue}
                            onEnhancementComplete={handleEnhancementComplete}
                            disabled={disabled || isEnhancing}
                        />
                        {(disabled || isEnhancing) ? (
                            <div className="w-5 h-5 flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                title="Send message"
                            >
                                <ArrowUpCircle size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );

    if (showWrapper) {
        return (
            <div className="w-full p-4 bg-[#f8f6f1] border-t border-gray-200">
                {inputContent}
            </div>
        );
    }

    return <div className="w-full">{inputContent}</div>;
};

export default ChatInput;