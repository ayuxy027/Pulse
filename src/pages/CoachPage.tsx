import React, { useState, useMemo, useCallback, useEffect } from 'react';
import ChatInterface from '../components/coach/ChatInterface';
import DeleteChatModal from '../components/coach/DeleteChatModal';
import { MessageSquare, Bot, User, Trash2, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchRecentChats, deleteChat, RecentChat } from '../services/chatService';
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
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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

    // Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;

        const query = searchQuery.toLowerCase();
        return conversations.filter(conversation =>
            conversation.title.toLowerCase().includes(query) ||
            conversation.preview.toLowerCase().includes(query)
        );
    }, [conversations, searchQuery]);

    const handleChatSelect = useCallback((chatId: string) => {
        setSelectedChat(chatId);
    }, []);

    const handleNewChat = useCallback(() => {
        setSelectedChat(null);
        setSearchQuery('');
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
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Your Personal AI Coach</h2>
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
                {/* Enhanced Header with Search & New Chat */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className={`w-4 h-4 transition-colors ${isSearchFocused ? 'text-gray-600' : 'text-gray-400'}`} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="text-lg">×</span>
                            </button>
                        )}
                    </div>

                    {/* New Chat Button */}
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-colors duration-200 shadow-lg"
                    >
                        <div className="p-1.5 bg-white/20 rounded-lg">
                            <Plus className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="font-semibold text-sm">New Chat</div>
                            <div className="text-xs text-gray-300">Start a fresh conversation</div>
                        </div>
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Loading State */}
                    {isLoadingChats && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-gray-500">Loading conversations...</p>
                        </div>
                    )}

                    {/* Conversations List */}
                    {!isLoadingChats && (
                        <>
                            {filteredConversations.length === 0 && searchQuery ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <Search className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">No conversations found</p>
                                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                                </div>
                            ) : (
                                filteredConversations.map((conversation) => (
                                    <div
                                        key={conversation.id}
                                        onClick={() => handleChatSelect(conversation.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => handleKeyDown(e, conversation.id)}
                                        className={`group p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${selectedChat === conversation.id
                                            ? 'bg-gray-50 border-gray-300'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg ${selectedChat === conversation.id
                                                ? 'bg-gray-200'
                                                : 'bg-gray-100'
                                                }`}>
                                                <MessageSquare className={`w-3.5 h-3.5 ${selectedChat === conversation.id
                                                    ? 'text-gray-700'
                                                    : 'text-gray-600'
                                                    }`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-medium text-sm truncate ${selectedChat === conversation.id
                                                    ? 'text-gray-900'
                                                    : 'text-gray-900'
                                                    }`}>
                                                    {conversation.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">
                                                    {conversation.timestamp}
                                                </span>
                                                {/* Delete Button - Always visible */}
                                                <button
                                                    onClick={(e) => handleDeleteChat(conversation.id, conversation.title, e)}
                                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors duration-200"
                                                    title="Delete chat"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
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

