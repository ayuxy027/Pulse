import React from 'react';
import ChatInput from './ChatInput';
import { ChatConversation as ChatConversationType } from '../../services/mockDataService';
import { SearchResult } from '../../services/searchService';

/**
 * ChatInterface - Main chat view displaying conversations list, chat input, and conversation history
 */

interface ChatInterfaceProps {
  searchResults?: SearchResult[];
  isSearching?: boolean;
  conversations?: ChatConversationType[];
  loading?: boolean;
  error?: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  searchResults,
  isSearching = false,
  conversations = [],
  loading = false,
  error = null
}) => {

  return (
    <div className="flex-1 flex flex-col bg-white" style={{
      padding: '24px',
      margin: '16px',
      borderRadius: '12px'
    }}>
      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Chat Input */}
        <div className="mb-10">
          <ChatInput />
        </div>

        {/* Chat Conversations */}
        <div className="space-y-6" style={{
          width: '568px',
          height: '240px',
          opacity: 1,
          marginTop: '24px'
        }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">Error: {error}</p>
            </div>
          ) : (isSearching ? (searchResults || []) : conversations).length > 0 ? (
            (isSearching ? (searchResults || []) : conversations).map((conversation: SearchResult | ChatConversationType) => (
              <div
                key={conversation.id}
                className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <h3 className="font-medium text-gray-900 mb-1">
                  {conversation.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {conversation.last_message}
                </p>

              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>{isSearching ? 'No search results found' : 'No conversations found'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 