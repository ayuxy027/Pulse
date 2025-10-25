import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentService } from '../../services/agentService';
import { getSupabaseUser } from '../../services/authService';
import ChatInput from './ChatInput';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { Bot, Loader2, Zap, Database } from 'lucide-react';

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
}

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'initial',
            content: 'Hello! I\'m your health coach. Ask me about your diet, nutrition, or attach specific data with @ mentions like @profile, @health, @today, @meals, @habits, or @reminders.',
            role: 'assistant',
            timestamp: new Date(),
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
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
                validMentions.length > 0 ? validMentions : undefined
            );

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
    }, [agentService, extractMentions, isValidMention]);

    const handleAttachData = useCallback(() => {
        // No separate attachment message - sent with query
    }, []);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className="flex gap-3 max-w-4xl">
                            {/* Avatar for assistant */}
                            {message.role === 'assistant' && (
                                <div className="shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            )}

                            {/* Message Content */}
                            <div
                                className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-800 shadow-sm border border-gray-100'
                                    }`}
                            >
                                {/* Message Content */}
                                <div className="prose prose-sm max-w-none">
                                    {message.role === 'assistant' ? (
                                        <MarkdownRenderer content={message.content} fontSize={14} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    )}
                                </div>

                                {/* Tool Calls - Tech Style */}
                                {message.toolCalls && message.toolCalls.length > 0 && (
                                    <div className="mt-3 space-y-2 pt-2 border-t border-gray-200/50">
                                        {message.toolCalls.map((toolCall) => (
                                            <div
                                                key={toolCall.id}
                                                className="flex items-center gap-2 text-xs font-mono"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {toolCall.status === 'initiated' && (
                                                        <>
                                                            <Zap className="w-3 h-3 text-yellow-500" />
                                                            <span className="text-cyan-400">Tool call initiated</span>
                                                            <span className="text-gray-500">→</span>
                                                            <span className="text-purple-400">@{toolCall.tool}</span>
                                                        </>
                                                    )}
                                                    {toolCall.status === 'fetching' && (
                                                        <>
                                                            <Database className="w-3 h-3 text-blue-500 animate-pulse" />
                                                            <span className="text-blue-400">Fetching</span>
                                                            <span className="text-gray-500">from Supabase</span>
                                                            <span className="text-gray-500">→</span>
                                                            <span className="text-green-400">@{toolCall.tool}</span>
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                                        </>
                                                    )}
                                                    {toolCall.status === 'completed' && (
                                                        <>
                                                            <Database className="w-3 h-3 text-green-500" />
                                                            <span className="text-green-400">Fetched</span>
                                                            <span className="text-gray-500">@{toolCall.tool}</span>
                                                            <span className="text-green-500 ml-1">✓</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className={`text-xs mt-2 opacity-70`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-3 max-w-4xl">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                <span className="text-sm text-gray-600">Thinking...</span>
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

