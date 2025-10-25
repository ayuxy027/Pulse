import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentService } from '../../services/agentService';
import { getSupabaseUser } from '../../services/authService';
import { fetchChatMessages } from '../../services/chatService';
import { getGroqResponse } from '../../services/llmService';
import ChatInput from './ChatInput';
import ToolCallNotification from './ToolCallNotification';
import { Bot, Loader2, Zap, Database, Sparkles, Brain, CheckCircle, Clock, User, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Sexy MarkdownRenderer component inspired by the reference
const MarkdownRenderer = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                li: ({ ...props }) => <li className="list-item marker:text-gray-600" {...props} />,
                a: ({ ...props }) => <a target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:underline" {...props} />,
                code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !match ? (
                        <code className="px-1 py-0.5 bg-gray-100 rounded text-sm font-mono" {...props}>{children}</code>
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
                    <strong className="font-semibold text-gray-900" {...props}>{children}</strong>
                ),
                em: ({ children, ...props }) => (
                    <em className="italic text-gray-600" {...props}>{children}</em>
                ),
                blockquote: ({ children, ...props }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-3" {...props}>{children}</blockquote>
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

                    // Convert to ChatMessage format
                    const formattedMessages: ChatMessage[] = chatMessages.map((msg, index) => ({
                        id: msg.id || `msg-${index}`,
                        content: msg.message_content,
                        role: msg.sender_type === 'user' ? 'user' : 'assistant',
                        timestamp: new Date(msg.created_at)
                    }));

                    setMessages(formattedMessages);
                } catch (error) {
                    console.error('Error loading chat messages:', error);
                    // Keep initial message if there's an error
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

        const toolCalls: ToolCall[] = validMentions.map((mention, idx) => ({
            id: `tool-${Date.now()}-${idx}`,
            tool: mention,
            status: 'initiated'
        }));

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content,
            role: 'user',
            timestamp: new Date(),
            context_data: validMentions.length > 0 ? { dataTypes: validMentions } : undefined,
            toolCalls: validMentions.length > 0 ? toolCalls : undefined
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        const animateToolCalls = async () => {
            for (let i = 0; i < toolCalls.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 300));
                setMessages(prev => prev.map(msg =>
                    msg.id === userMessage.id
                        ? {
                            ...msg,
                            toolCalls: msg.toolCalls?.map((tc, idx) =>
                                idx === i ? { ...tc, status: 'fetching' as const } : tc
                            )
                        }
                        : msg
                ));

                await new Promise(resolve => setTimeout(resolve, 400));
                setMessages(prev => prev.map(msg =>
                    msg.id === userMessage.id
                        ? {
                            ...msg,
                            toolCalls: msg.toolCalls?.map((tc, idx) =>
                                idx === i ? { ...tc, status: 'completed' as const } : tc
                            )
                        }
                        : msg
                ));
            }
        };

        if (validMentions.length > 0) {
            animateToolCalls();
        }

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

            // Create tool calls for auto-detected tools if they exist
            const autoDetectedToolCalls: ToolCall[] = result.autoDetectedTools?.map((tool, idx) => ({
                id: `auto-tool-${Date.now()}-${idx}`,
                tool: tool,
                status: 'completed' as const
            })) || [];

            // No separate tool notification - tools will be shown in main response

            // Add streaming delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            const assistantMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                content: result.response,
                role: 'assistant',
                timestamp: new Date(),
                thinking: result.thinking,
                context_data: result.contextUsed,
                toolCalls: autoDetectedToolCalls.length > 0 ? autoDetectedToolCalls : undefined
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
            {/* Messages Area - No header here since it's in CoachPage */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#f8f6f1]">
                {messages.map((message, index) => (
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

                                {/* Tool Calls - Beautiful Notification */}
                                {message.toolCalls && message.toolCalls.length > 0 && (
                                    <ToolCallNotification
                                        toolCalls={message.toolCalls}
                                        isAutoDetected={message.toolCalls.some(tc => tc.id.startsWith('auto-tool-'))}
                                    />
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
                            <div className="max-w-[80%] bg-white text-gray-800 rounded-2xl p-4 shadow-lg border-2 border-gray-200 flex items-center gap-3"
                            >
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

