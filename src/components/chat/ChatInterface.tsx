import React, { useState, useEffect, useRef } from 'react';
import { AgentService } from '../../services/agentService';
import { getSupabaseUser } from '../../services/authService';
import ChatInput from './ChatInput';
import { ImageAnalysisService } from '../../services/imageAnalysisService';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { Bot, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  thinking?: string; // For dual agent thinking process
  context_data?: any; // For attached data context
  attachments?: string[]; // For image attachments
}

interface ChatInterfaceProps {
  conversations?: any[];
  loading?: boolean;
  error?: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = (props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      content: 'Hello! I\'m your health coach. Ask me about your diet, nutrition, or attach specific data with @ mentions.',
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const agentService = useRef(new AgentService()).current;
  const imageAnalysisService = useRef(new ImageAnalysisService()).current;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Extract @ mentions from query
  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@(\w+)/g) || [];
    return mentions.map(m => m.substring(1)); // Remove @
  };

  const handleSendMessage = async (content: string) => {
    const user = await getSupabaseUser();
    if (!user) return;

    // Extract @ mentions for context filtering
    const mentions = extractMentions(content);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Process through dual agents with context filtering
      const result = await agentService.processUserQuery(user.id, content, mentions.length > 0 ? mentions : undefined);

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
  };

  const handleAttachData = (dataType: string) => {
    // Show attachment in message for UI feedback
    const attachedMessage: ChatMessage = {
      id: `attach-${Date.now()}`,
      content: `@${dataType} attached`,
      role: 'user',
      timestamp: new Date(),
      context_data: { dataType }
    };
    setMessages(prev => [...prev, attachedMessage]);
  };

  const handleAttachImage = async (file: File) => {
    const user = await getSupabaseUser();
    if (!user) return;

    // Add image upload message
    const uploadMessage: ChatMessage = {
      id: `upload-${Date.now()}`,
      content: 'Processing image...',
      role: 'user',
      timestamp: new Date(),
      attachments: [URL.createObjectURL(file)]
    };
    setMessages(prev => [...prev, uploadMessage]);

    try {
      // Analyze image
      const analysis = await imageAnalysisService.analyzeFoodImage(file);

      // Add analysis as AI response
      const analysisMessage: ChatMessage = {
        id: `analysis-${Date.now()}`,
        content: `Analyzed your meal: **${analysis.foodName}**\n\n**Calories:** ${analysis.calories}\n**Health Score:** ${analysis.healthVerdict?.healthScore}/100\n\n${analysis.analysisSummary}`,
        role: 'assistant',
        timestamp: new Date(),
        thinking: `Image analysis completed`,
        context_data: analysis
      };

      setMessages(prev => [...prev, analysisMessage]);
    } catch (error) {
      console.error('Error analyzing image:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, I had trouble analyzing your image. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex gap-3 max-w-3xl">
              {/* Avatar for assistant */}
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div
                className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                  }`}
              >
                {/* Image Attachments */}
                {message.attachments && message.attachments.map((url, idx) => (
                  <div key={idx} className="mb-2">
                    <img
                      src={url}
                      alt="Uploaded meal"
                      className="max-w-xs rounded-lg border border-gray-200"
                    />
                  </div>
                ))}

                {/* Thinking Process (collapsible) */}
                {message.thinking && message.role === 'assistant' && (
                  <details className="mb-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      View analysis
                    </summary>
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-gray-700 border border-yellow-200">
                      {message.thinking}
                    </div>
                  </details>
                )}

                {/* Message Content */}
                <div className="prose prose-sm max-w-none">
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} fontSize={14} />
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white text-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
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
        onAttachImage={handleAttachImage}
        disabled={isLoading}
      />
    </div>
  );
};

export default ChatInterface;