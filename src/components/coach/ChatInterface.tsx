import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AgentService } from '../../services/agentService';
import { getSupabaseUser } from '../../services/authService';
import ChatInput from './ChatInput';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { Bot, Loader2 } from 'lucide-react';

interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    thinking?: string; // For dual agent thinking process
    context_data?: {
        dataType?: string;
        [key: string]: unknown;
    }; // For attached data context via @-mentions
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
        // Only scroll to bottom when new messages are added, not on initial load
        if (messages.length > 1) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom]);

    // Extract @ mentions from query - memoized and enhanced
    const extractMentions = useCallback((text: string): string[] => {
        const mentions = text.match(/@(\w+)/g) || [];
        return mentions.map(m => m.substring(1).toLowerCase()); // Remove @ and normalize
    }, []);

    // Validate mention types
    const isValidMention = useCallback((mention: string): boolean => {
        const validMentions = ['profile', 'health', 'today', 'meals', 'habits', 'reminders'];
        return validMentions.includes(mention.toLowerCase());
    }, []);

    const handleSendMessage = useCallback(async (content: string) => {
        const user = await getSupabaseUser();
        if (!user) return;

        // Extract @ mentions for context filtering
        const mentions = extractMentions(content);
        const validMentions = mentions.filter(m => isValidMention(m));

        // Add user message with context data
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
            // Process through dual agents with context filtering
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

    const handleAttachData = useCallback((dataType: string) => {
        // Show attachment in message for UI feedback
        const attachedMessage: ChatMessage = {
            id: `attach-${Date.now()}`,
            content: `@${dataType} attached`,
            role: 'user',
            timestamp: new Date(),
            context_data: { dataType }
        };
        setMessages(prev => [...prev, attachedMessage]);
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
                                {/* Thinking Process (collapsible) */}
                                {message.thinking && message.role === 'assistant' && (
                                    <details className="mb-2">
                                        <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                                            View analysis
                                        </summary>
                                        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-700 border border-gray-200">
                                            {message.thinking}
                                        </div>
                                    </details>
                                )}

                                {/* Message Content */}
                                <div className="prose prose-sm max-w-none">
                                    {message.role === 'assistant' ? (
                                        <MarkdownRenderer content={message.content} fontSize={14} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    )}
                                </div>

                                {/* Context Badge */}
                                {message.context_data && message.context_data.dataType && (
                                    <div className="mt-2 text-xs italic opacity-75">
                                        [Attached: {message.context_data.dataType}]
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

