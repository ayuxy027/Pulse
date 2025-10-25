import React, { useState, useMemo, useCallback } from 'react';
import ChatInterface from '../components/coach/ChatInterface';

interface Conversation {
    id: string;
    title: string;
    preview: string;
    timestamp: string;
}

/**
 * CoachPage - Dual Agent System for Health Coaching
 * Uses Analyzer Agent (Groq) + Coach Agent (DeepSeek)
 */
const CoachPage: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState<string | null>(null);

    // Memoize conversations to prevent unnecessary re-renders
    const conversations = useMemo<Conversation[]>(() => [
        {
            id: '1',
            title: 'BMI Analysis Discussion',
            preview: 'Your BMI is in the normal range, but we should focus on muscle building.',
            timestamp: '2024-01-15'
        },
        {
            id: '2',
            title: 'Nutrition Planning',
            preview: 'Can you help me create a meal plan for weight loss?',
            timestamp: '2024-01-14'
        },
        {
            id: '3',
            title: 'Workout Strategy',
            preview: 'We need to increase your cardio sessions to meet your fitness goals.',
            timestamp: '2024-01-13'
        }
    ], []);

    const handleChatSelect = useCallback((chatId: string) => {
        setSelectedChat(chatId);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, chatId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChatSelect(chatId);
        }
    }, [handleChatSelect]);

    return (
        <div className="h-[calc(100vh-100px)] bg-gray-50 flex">
            {/* Left Column - Full Chat Interface */}
            <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
                <ChatInterface
                    conversations={[]}
                    loading={false}
                    error={null}
                />
            </div>

            {/* Right Column - Chat History */}
            <div className="w-80 bg-white flex flex-col border-l border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() => handleChatSelect(conversation.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedChat === conversation.id
                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 text-sm">
                                    {conversation.title}
                                </h4>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {conversation.preview}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoachPage;

