import React, { useState } from 'react';
import ChatInterface from '../components/coach/ChatInterface';
import ChatHeader from '../components/coach/ChatHeader';
import ChatInput from '../components/coach/ChatInput';
import { Plus, MoreVertical, FileText, ArrowLeft } from 'lucide-react';

/**
 * CoachPage - Dual Agent System for Health Coaching
 * Uses Analyzer Agent (Groq) + Coach Agent (DeepSeek)
 */
const CoachPage: React.FC = () => {
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [conversations] = useState([
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
    ]);

    const [documents] = useState([
        { id: '1', name: 'BMI Calculator...', size: '2.4 MB', type: 'pdf' },
        { id: '2', name: 'Nutrition Plan 2...', size: '1.8 MB', type: 'pdf' },
        { id: '3', name: 'Workout Guide...', size: '856 KB', type: 'word' },
        { id: '4', name: 'Health Metrics...', size: '1.2 MB', type: 'pdf' }
    ]);

    const handleSendMessage = (message: string) => {
        // This will be handled by ChatInterface
        console.log('Sending message:', message);
    };

    const handleAttachData = (dataType: string) => {
        console.log('Attaching data:', dataType);
    };

    const handleAttachImage = (file: File) => {
        console.log('Attaching image:', file);
    };

    return (
        <div className="w-full bg-gray-50 flex flex-col min-h-screen">
            <ChatHeader
                conversations={[]}
                onSearchResults={() => { }}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Column - Chats */}
                <div className="w-2/3 flex flex-col bg-white border-r border-gray-200">
                    {/* Show ChatInterface when a conversation is selected */}
                    {selectedChat ? (
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {/* Back Button */}
                            <div className="p-4 border-b border-gray-200">
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="text-sm font-medium">Back to Chats</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <ChatInterface
                                    conversations={[]}
                                    loading={false}
                                    error={null}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chats</h2>

                                {/* Chat Input Area */}
                                <ChatInput
                                    onSendMessage={handleSendMessage}
                                    onAttachData={handleAttachData}
                                    onAttachImage={handleAttachImage}
                                    disabled={false}
                                    showWrapper={false}
                                />
                            </div>

                            {/* Chat Conversations List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                {conversations.map((conversation) => (
                                    <div
                                        key={conversation.id}
                                        onClick={() => setSelectedChat(conversation.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedChat === conversation.id
                                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {conversation.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {conversation.preview}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column - Project Knowledge & Documents */}
                <div className="w-1/3 bg-white flex flex-col p-6 space-y-6">
                    {/* Project Knowledge Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Project Knowledge</h3>
                            <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                                <Plus className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">10% of Project Capacity Used</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: '10%' }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Documents Section */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Documents
                                <span className="ml-2 text-sm font-normal text-gray-500">({documents.length})</span>
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`shrink-0 ${doc.type === 'pdf' ? 'text-red-500' : 'text-blue-500'
                                            }`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {doc.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{doc.size}</p>
                                        </div>
                                    </div>
                                    <button className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachPage;

