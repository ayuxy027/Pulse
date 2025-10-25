import React from 'react';
import SearchBar from './SearchBar';
import { SearchResult } from '../../services/searchService';

interface Conversation {
    id: number;
    title: string;
    last_message: string;
    created_at: string;
    updated_at: string;
}

interface ChatHeaderProps {
    conversations: Conversation[];
    onSearchResults: (results: SearchResult[]) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    conversations,
    onSearchResults
}) => {
    return (
        <header className="bg-white border-b border-gray-200 px-12 py-[13px] flex items-center justify-between flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-900">Coach</h1>

            <div className="flex items-center gap-4">
                {/* Search Bar */}
                <SearchBar
                    conversations={conversations}
                    onSearchResults={onSearchResults}
                    placeholder="Search for your Chats"
                />

            </div>
        </header>
    );
};

export default ChatHeader;

