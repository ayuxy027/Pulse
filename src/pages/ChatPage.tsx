import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import ChatHeader from '../components/chat/ChatHeader';

/**
 * ChatPage - Dual Agent System for Health Coaching
 * Uses Analyzer Agent (Groq) + Coach Agent (DeepSeek)
 */
const ChatPage: React.FC = () => {
  return (
    <div className="w-full bg-[#f8f6f1] flex flex-col min-h-screen">
      <ChatHeader
        conversations={[]}
        onSearchResults={() => { }}
      />
      <div className="flex-1 p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full">
          <ChatInterface
            conversations={[]}
            loading={false}
            error={null}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;