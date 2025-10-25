import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentService } from '../../services/agentService';
import { getSupabaseUser } from '../../services/authService';
import { fetchChatMessages } from '../../services/chatService';
import ChatInput from './ChatInput';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { Bot, Loader2, Zap, Database, Sparkles, Brain, CheckCircle, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

            const assistantMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                content: result.response,
                role: 'assistant',
                timestamp: new Date(),
                thinking: result.thinking,
                context_data: result.contextUsed
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
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className="flex gap-4 max-w-4xl">
                                {/* Avatar - Only for assistant */}
                                {message.role === 'assistant' && (
                                    <div className="shrink-0">
                                        <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center shadow-sm">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                )}

                                {/* Message Content */}
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    className={`rounded-xl px-5 py-4 max-w-2xl shadow-sm ${message.role === 'user'
                                        ? 'bg-gray-700 text-white'
                                        : 'bg-white text-gray-800 border border-gray-200'
                                        }`}
                                >
                                    {/* Message Content */}
                                    <div className="prose prose-sm max-w-none">
                                        {message.role === 'assistant' ? (
                                            <MarkdownRenderer
                                                content={message.content}
                                                fontSize={14}
                                                color="#374151"
                                            />
                                        ) : (
                                            <p className="whitespace-pre-wrap text-white text-sm leading-relaxed tracking-tight">{message.content}</p>
                                        )}
                                    </div>

                                    {/* Tool Calls - Beautiful Style */}
                                    {message.toolCalls && message.toolCalls.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-4 space-y-3 pt-4 border-t border-gray-200/50"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sparkles className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium tracking-tight text-gray-700">Fetching your data...</span>
                                            </div>
                                            {message.toolCalls.map((toolCall, idx) => (
                                                <motion.div
                                                    key={toolCall.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {toolCall.status === 'initiated' && (
                                                            <>
                                                                <div className="p-1.5 bg-gray-200 rounded-lg">
                                                                    <Zap className="w-3 h-3 text-gray-600" />
                                                                </div>
                                                                <span className="text-sm font-medium tracking-tight text-gray-700">Initializing</span>
                                                                <span className="text-gray-400">→</span>
                                                                <span className="text-sm font-semibold tracking-tight text-gray-800">@{toolCall.tool}</span>
                                                            </>
                                                        )}
                                                        {toolCall.status === 'fetching' && (
                                                            <>
                                                                <div className="p-1.5 bg-gray-200 rounded-lg">
                                                                    <Database className="w-3 h-3 text-gray-600 animate-pulse" />
                                                                </div>
                                                                <span className="text-sm font-medium tracking-tight text-gray-700">Fetching</span>
                                                                <span className="text-gray-400">from database</span>
                                                                <span className="text-gray-400">→</span>
                                                                <span className="text-sm font-semibold tracking-tight text-gray-800">@{toolCall.tool}</span>
                                                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-ping"></div>
                                                            </>
                                                        )}
                                                        {toolCall.status === 'completed' && (
                                                            <>
                                                                <div className="p-1.5 bg-gray-200 rounded-lg">
                                                                    <CheckCircle className="w-3 h-3 text-gray-700" />
                                                                </div>
                                                                <span className="text-sm font-medium tracking-tight text-gray-700">Completed</span>
                                                                <span className="text-gray-400">@{toolCall.tool}</span>
                                                                <span className="text-gray-600 ml-1">✓</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Timestamp */}
                                    <div className={`flex items-center gap-2 mt-3 text-xs tracking-tight ${message.role === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                                        <Clock className="w-3 h-3" />
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Indicator */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-4 max-w-4xl">
                                <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center shadow-sm shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <motion.div
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    className="bg-white text-gray-800 rounded-xl px-5 py-4 shadow-sm border border-gray-200 flex items-center gap-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Brain className="w-4 h-4 text-gray-700 animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                                            <span className="text-sm font-medium tracking-tight text-gray-700">AI is thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

