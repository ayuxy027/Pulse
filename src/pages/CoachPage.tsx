import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ChatInterface from '../components/coach/ChatInterface';
import DeleteChatModal from '../components/coach/DeleteChatModal';
import { MessageSquare, History, Bot, User, Trash2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchRecentChats, fetchChatMessages, deleteChat, RecentChat } from '../services/chatService';
import { getSupabaseUser } from '../services/authService';

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
    const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [hoveredChat, setHoveredChat] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);

    // Load recent chats on mount
    useEffect(() => {
        const loadRecentChats = async () => {
            try {
                const user = await getSupabaseUser();
                if (user) {
                    const chats = await fetchRecentChats(user.id, 20);
                    setRecentChats(chats);
                }
            } catch (error) {
                console.error('Error loading recent chats:', error);
            } finally {
                setIsLoadingChats(false);
            }
        };

        loadRecentChats();
    }, []);

    // Transform RecentChat to Conversation format for display
    const conversations = useMemo<Conversation[]>(() => {
        return recentChats.map(chat => ({
            id: chat.chat_id,
            title: chat.chat_title,
            preview: chat.message_content.substring(0, 100) + (chat.message_content.length > 100 ? '...' : ''),
            timestamp: new Date(chat.created_at).toLocaleDateString()
        }));
    }, [recentChats]);

    const handleChatSelect = useCallback((chatId: string) => {
        setSelectedChat(chatId);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, chatId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleChatSelect(chatId);
        }
    }, [handleChatSelect]);

    const handleDeleteChat = useCallback((chatId: string, chatTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setChatToDelete({ id: chatId, title: chatTitle });
        setDeleteModalOpen(true);
    }, []);

    const confirmDeleteChat = useCallback(async () => {
        if (!chatToDelete) return;

        try {
            const user = await getSupabaseUser();
            if (user) {
                const success = await deleteChat(user.id, chatToDelete.id);
                if (success) {
                    // Remove from local state
                    setRecentChats(prev => prev.filter(chat => chat.chat_id !== chatToDelete.id));

                    // If this was the selected chat, clear selection
                    if (selectedChat === chatToDelete.id) {
                        setSelectedChat(null);
                    }
                } else {
                    alert('Failed to delete chat. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
            alert('Failed to delete chat. Please try again.');
        } finally {
            setDeleteModalOpen(false);
            setChatToDelete(null);
        }
    }, [chatToDelete, selectedChat]);

    const refreshChats = useCallback(async () => {
        try {
            const user = await getSupabaseUser();
            if (user) {
                const chats = await fetchRecentChats(user.id, 20);
                setRecentChats(chats);
            }
        } catch (error) {
            console.error('Error refreshing chats:', error);
        }
    }, []);

    return (
        <div className="h-[calc(100vh-100px)] bg-[#f8f6f1] flex">
            {/* Left Column - Full Chat Interface */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex flex-col bg-white border-r border-gray-200 shadow-lg"
            >
                {/* Enhanced Header */}
                <div className="p-6 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-2xl">
                            <Bot className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">AI Health Coach</h2>
                            <p className="text-sm text-gray-600">Your personalized health and nutrition assistant</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-700">Online</span>
                        </div>
                    </div>
                </div>

                {/* Chat Interface */}
                <ChatInterface
                    selectedChatId={selectedChat}
                    onChatCreated={(chatId) => {
                        setSelectedChat(chatId);
                        refreshChats();
                    }}
                />
            </motion.div>

            {/* Right Column - Chat History */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-80 bg-gradient-to-b from-white to-gray-50 flex flex-col border-l border-gray-200 shadow-xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                            <History className="w-5 h-5 text-blue-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight text-gray-900">Chat History</h3>
                            <p className="text-xs text-gray-500">Previous conversations</p>
                        </div>
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Loading State */}
                    {isLoadingChats && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-gray-500">Loading conversations...</p>
                        </div>
                    )}

                    {/* Conversations List */}
                    {!isLoadingChats && (
                        <AnimatePresence>
                            {conversations.map((conversation, index) => (
                                <motion.div
                                    key={conversation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleChatSelect(conversation.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                                    onMouseEnter={() => setHoveredChat(conversation.id)}
                                    onMouseLeave={() => setHoveredChat(null)}
                                    className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedChat === conversation.id
                                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-lg'
                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className={`p-2 rounded-xl ${selectedChat === conversation.id
                                            ? 'bg-gradient-to-br from-blue-200 to-indigo-200'
                                            : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100'
                                            }`}>
                                            <MessageSquare className={`w-4 h-4 ${selectedChat === conversation.id
                                                ? 'text-blue-700'
                                                : 'text-gray-600 group-hover:text-blue-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-semibold text-sm truncate tracking-tight ${selectedChat === conversation.id
                                                ? 'text-gray-900'
                                                : 'text-gray-900'
                                                }`}>
                                                {conversation.title}
                                            </h4>
                                        </div>
                                        {/* Delete Button - Only show on hover */}
                                        <AnimatePresence>
                                            {hoveredChat === conversation.id && (
                                                <motion.button
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    onClick={(e) => handleDeleteChat(conversation.id, conversation.title, e)}
                                                    className="p-2 rounded-xl bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                                    title="Delete chat"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2 ml-8">
                                        {conversation.preview}
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 ml-8">
                                        <span className="text-xs text-gray-400">
                                            {conversation.timestamp}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Empty State */}
                    {!isLoadingChats && conversations.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="p-4 bg-gray-100 rounded-full mb-4">
                                <MessageSquare className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">No conversations yet</p>
                            <p className="text-xs text-gray-500">Start chatting to see history here</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="w-4 h-4" />
                        <span>AI-powered health coaching</span>
                    </div>
                </div>
            </motion.div>

            {/* Delete Chat Modal */}
            <DeleteChatModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDeleteChat}
                chatTitle={chatToDelete?.title || ''}
            />
        </div>
    );
};

export default CoachPage;

