import React from 'react';
import SearchBar from './SearchBar';
import { ChatConversation } from '../../services/mockDataService';
import { SearchResult } from '../../services/searchService';

interface ChatHeaderProps {
  conversations: ChatConversation[];
  onSearchResults: (results: SearchResult[]) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversations,
  onSearchResults
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-12 py-[13px] flex items-center justify-between flex-shrink-0">
      <h1 className="text-xl font-semibold text-gray-900">Chats</h1>

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
