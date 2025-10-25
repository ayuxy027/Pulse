import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentService } from '../../services/agentService';
import { getSupabaseUser } from '../../services/authService';
import { fetchChatMessages } from '../../services/chatService';
import { Bot, Loader2, Brain, Clock, AtSign, ArrowUpCircle, User, BarChart3, Calendar, Utensils, Dumbbell, Settings, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PromptEnhancer from './PromptEnhancer';

// Sexy MarkdownRenderer component inspired by the reference
const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                li: ({ ...props }) => <li className="list-item marker:text-gray-600" {...props} />,
                a: ({ ...props }) => <a target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium" {...props} />,
                code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !match ? (
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800" {...props}>{children}</code>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                h1: ({ children, ...props }) => (
                    <h1 className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0" {...props}>{children}</h1>
                ),
                h2: ({ children, ...props }) => (
                    <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-3" {...props}>{children}</h2>
                ),
                h3: ({ children, ...props }) => (
                    <h3 className="text-base font-semibold text-gray-700 mb-2 mt-2" {...props}>{children}</h3>
                ),
                p: ({ children, ...props }) => (
                    <p className="text-gray-700 leading-relaxed mb-2" {...props}>{children}</p>
                ),
                ul: ({ children, ...props }) => (
                    <ul className="list-disc list-inside space-y-1 mb-3" {...props}>{children}</ul>
                ),
                ol: ({ children, ...props }) => (
                    <ol className="list-decimal list-inside space-y-1 mb-3" {...props}>{children}</ol>
                ),
                strong: ({ children, ...props }) => (
                    <strong className="font-bold text-gray-900" {...props}>{children}</strong>
                ),
                em: ({ children, ...props }) => (
                    <em className="italic text-gray-700 font-medium" {...props}>{children}</em>
                ),
                u: ({ children, ...props }) => (
                    <u className="underline decoration-2 underline-offset-2" {...props}>{children}</u>
                ),
                blockquote: ({ children, ...props }) => (
                    <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-3 bg-blue-50 py-2 rounded-r" {...props}>{children}</blockquote>
                ),
                // Enhanced table support
                table: ({ children, ...props }) => (
                    <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-gray-200 rounded-lg" {...props}>{children}</table>
                    </div>
                ),
                th: ({ children, ...props }) => (
                    <th className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-left font-semibold text-gray-800" {...props}>{children}</th>
                ),
                td: ({ children, ...props }) => (
                    <td className="px-4 py-2 border-b border-gray-200 text-gray-700" {...props}>{children}</td>
                )
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    thinking?: string; // For dual agent thinking process
    context_data?: {
        dataType?: string;
        dataTypes?: string[];
        [key: string]: unknown;
    }; // For attached data context via @-mentions
    toolCalls?: ToolCall[]; // Track tool calls for UI display
}

interface ToolCall {
    id: string;
    tool: string;
    status: 'initiated' | 'fetching' | 'completed';
    data?: unknown;
}

interface ChatInterfaceProps {
    conversations?: unknown[];
    loading?: boolean;
    error?: string | null;
    selectedChatId?: string | null;
    onChatCreated?: (chatId: string) => void;
}

// Embedded Tool Call Notification Component
const EmbeddedToolCallNotification: React.FC<{
    toolCalls: ToolCall[];
}> = ({ toolCalls }) => {
    const getToolIcon = (tool: string) => {
        switch (tool) {
            case 'profile': return <User className="w-5 h-5 text-gray-600" />;
            case 'health': return <BarChart3 className="w-5 h-5 text-gray-600" />;
            case 'today': return <Calendar className="w-5 h-5 text-gray-600" />;
            case 'meals': return <Utensils className="w-5 h-5 text-gray-600" />;
            case 'habits': return <Dumbbell className="w-5 h-5 text-gray-600" />;
            case 'reminders': return <Clock className="w-5 h-5 text-gray-600" />;
            default: return <Settings className="w-5 h-5 text-gray-600" />;
        }
    };

    const getToolName = (tool: string) => {
        switch (tool) {
            case 'profile': return 'Profile Data';
            case 'health': return 'Health Metrics';
            case 'today': return 'Today\'s Tracking';
            case 'meals': return 'Recent Meals';
            case 'habits': return 'Habits';
            case 'reminders': return 'Reminders';
            default: return tool;
        }
    };

    const getTableName = (tool: string) => {
        switch (tool) {
            case 'profile': return 'user_profiles';
            case 'health': return 'health_metrics';
            case 'today': return 'daily_tracking';
            case 'meals': return 'diet_entries';
            case 'habits': return 'habits';
            case 'reminders': return 'reminders';
            default: return tool;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="p-3 rounded-lg border bg-gray-50 border-gray-200"
        >
            {/* Compact Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gray-200 rounded-lg">
                    <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700">
                        Auto-detected tools
                    </span>
                </div>
            </div>

            {/* Compact Tool List */}
            <div className="flex flex-wrap gap-2">
                {toolCalls.map((toolCall, index) => (
                    <motion.div
                        key={toolCall.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200"
                    >
                        <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                            {getToolIcon(toolCall.tool)}
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                            {getToolName(toolCall.tool)}
                        </span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                    </motion.div>
                ))}
            </div>

            {/* Compact Footer with table names */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-center"
            >
                <span className="text-xs text-gray-500">
                    from {toolCalls.map(tc => getTableName(tc.tool)).join(' and ')} table{toolCalls.length > 1 ? 's' : ''}
                </span>
            </motion.div>
        </motion.div>
    );
};

// Chat Input Component
const ChatInput: React.FC<{
    onSendMessage: (message: string) => void;
    onAttachData: (dataType: string) => void;
    disabled?: boolean;
}> = ({ onSendMessage, onAttachData, disabled }) => {
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

    return (
        <div className="w-full p-4 bg-[#f8f6f1] border-t border-gray-200">
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
        </div>
    );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    selectedChatId,
    onChatCreated
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'initial',
            content: 'Hello! I\'m your health coach. Ask me about your diet, nutrition, or attach specific data with @ mentions like @profile, @health, @today, @meals, @habits, or @reminders.',
            role: 'assistant',
            timestamp: new Date(),
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const agentService = useRef(new AgentService()).current;

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (messages.length > 1) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom]);

    // Load chat messages when selectedChatId changes
    useEffect(() => {
        const loadChatMessages = async () => {
            if (selectedChatId) {
                setIsLoading(true);
                try {
                    const user = await getSupabaseUser();
                    if (!user) return;

                    // Set current chat ID
                    setCurrentChatId(selectedChatId);

                    // Fetch messages for the selected chat
                    const chatMessages = await fetchChatMessages(user.id, selectedChatId);

                    // Convert to ChatMessage format - database messages don't have toolCalls
                    const formattedMessages: ChatMessage[] = chatMessages.map((msg, index) => ({
                        id: msg.id || `msg-${index}`,
                        content: msg.message_content,
                        role: msg.sender_type === 'user' ? 'user' : 'assistant',
                        timestamp: new Date(msg.created_at)
                    }));

                    setMessages(formattedMessages);
                } catch (error) {
                    console.error('Error loading chat messages:', error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                // Reset to initial state when no chat is selected
                setMessages([
                    {
                        id: 'initial',
                        content: 'Hello! I\'m your health coach. Ask me about your diet, nutrition, or attach specific data with @ mentions like @profile, @health, @today, @meals, @habits, or @reminders.',
                        role: 'assistant',
                        timestamp: new Date(),
                    }
                ]);
                setCurrentChatId(null);
            }
        };

        loadChatMessages();
    }, [selectedChatId]);

    const extractMentions = useCallback((text: string): string[] => {
        const mentions = text.match(/@(\w+)/g) || [];
        return mentions.map(m => m.substring(1).toLowerCase());
    }, []);

    const isValidMention = useCallback((mention: string): boolean => {
        const validMentions = ['profile', 'health', 'today', 'meals', 'habits', 'reminders'];
        return validMentions.includes(mention.toLowerCase());
    }, []);

    const handleSendMessage = useCallback(async (content: string) => {
        const user = await getSupabaseUser();
        if (!user) return;

        const mentions = extractMentions(content);
        const validMentions = mentions.filter(m => isValidMention(m));

        // Create user message WITHOUT tool calls (first notification disabled)
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content,
            role: 'user',
            timestamp: new Date(),
            context_data: validMentions.length > 0 ? { dataTypes: validMentions } : undefined
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const result = await agentService.processUserQuery(
                user.id,
                content,
                validMentions.length > 0 ? validMentions : undefined,
                currentChatId
            );

            // Update currentChatId if we got a new one
            if (result.chatId) {
                setCurrentChatId(result.chatId);

                // Call parent callback when new chat is created
                if (!selectedChatId && onChatCreated) {
                    onChatCreated(result.chatId);
                }
            }

            // Create tool calls for actually used tools (union of mentions and auto-detected)
            const usedToolCalls: ToolCall[] = result.toolsUsed?.map((tool: string, idx: number) => ({
                id: `tool-${Date.now()}-${idx}`,
                tool: tool,
                status: 'completed' as const
            })) || [];

            // Add streaming delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create assistant message with embedded tool calls
            const assistantMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                content: result.response,
                role: 'assistant',
                timestamp: new Date(),
                thinking: result.thinking,
                context_data: result.contextUsed,
                toolCalls: usedToolCalls.length > 0 ? usedToolCalls : undefined
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Error processing message:', error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                content: 'Sorry, I encountered an error processing your request. Please try again later.',
                role: 'assistant',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [agentService, extractMentions, isValidMention, currentChatId, selectedChatId, onChatCreated]);

    const handleAttachData = useCallback(() => {
        // No separate attachment message - sent with query
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#f8f6f1]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#f8f6f1]">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="flex gap-4 max-w-4xl">
                            {/* Avatar - Only for assistant */}
                            {message.role === 'assistant' && (
                                <div className="shrink-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            )}

                            {/* Message Content */}
                            <div
                                className={`max-w-[80%] p-4 rounded-2xl shadow-lg border-2 transition-colors duration-200 ${message.role === 'user'
                                    ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-white border-gray-600 ml-auto'
                                    : 'bg-white text-gray-800 border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                {/* Message Content */}
                                <div className="prose prose-sm max-w-none">
                                    {message.role === 'assistant' ? (
                                        <MarkdownRenderer content={message.content} />
                                    ) : (
                                        <p className="whitespace-pre-wrap text-white text-sm leading-relaxed">{message.content}</p>
                                    )}
                                </div>

                                {/* Embedded Tool Call Notification - Only for assistant messages with toolCalls */}
                                {/* This is embedded to avoid duplicate separate notification messages, which caused issues in past refactors */}
                                {message.role === 'assistant' && message.toolCalls && message.toolCalls.length > 0 && (
                                    <div className="mt-4">
                                        <EmbeddedToolCallNotification
                                            toolCalls={message.toolCalls}
                                        />
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className={`flex items-center gap-2 mt-3 text-xs tracking-tight ${message.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                                    <Clock className="w-3 h-3" />
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-4 max-w-4xl">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="max-w-[80%] bg-white text-gray-800 rounded-2xl p-4 shadow-lg border-2 border-gray-200 flex items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
                                        <Brain className="w-5 h-5 text-gray-600 animate-pulse" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-800">AI is thinking...</span>
                                            <span className="text-xs text-gray-500">Analyzing your question and gathering insights</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Static dots */}
                                <div className="flex gap-1 ml-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <ChatInput
                onSendMessage={handleSendMessage}
                onAttachData={handleAttachData}
                disabled={isLoading}
            />
        </div>
    );
};

export default ChatInterface;