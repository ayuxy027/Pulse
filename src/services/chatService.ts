import { supabase } from './supabase';

export interface RecentChat {
  id: string;
  user_id: string;
  chat_id: string;
  chat_title: string;
  message_content: string;
  sender_type: 'user' | 'coach' | 'analyzer';
  sender_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Generate a chat title from the first message
 */
const generateChatTitle = (firstMessage: string, maxLength: number = 50): string => {
  // Clean up the message
  let title = firstMessage.trim();
  
  // Remove markdown formatting
  title = title.replace(/#{1,6}\s*/g, ''); // Remove headers
  title = title.replace(/\*\*(.+?)\*\*/g, '$1'); // Remove bold
  title = title.replace(/\*(.+?)\*/g, '$1'); // Remove italic
  title = title.replace(/\[(.+?)\]\(.+?\)/g, '$1'); // Remove links
  title = title.replace(/`(.+?)`/g, '$1'); // Remove code
  
  // Take first sentence or first N characters
  const firstSentence = title.split(/[.!?]/)[0];
  const preview = firstSentence || title;
  
  // Trim to max length
  if (preview.length > maxLength) {
    return preview.substring(0, maxLength).trim() + '...';
  }
  
  return preview.trim() || 'New Chat';
};

/**
 * Store a chat message in the database
 */
export const storeChatMessage = async (
  userId: string,
  chatId: string | null,
  message: ChatMessage,
  chatTitle?: string
): Promise<{ chatId: string; success: boolean; error?: string }> => {
  try {
    // If no chatId provided, create a new one
    const newChatId = chatId || crypto.randomUUID();
    
    // Generate title from first message if not provided
    const title = chatTitle || generateChatTitle(message.content);
    
    // Determine sender type and name
    const senderType = message.role === 'user' ? 'user' : 'coach';
    const senderName = message.role === 'user' ? null : 'AI Health Coach';
    
    // Insert the message
    const { error } = await supabase
      .from('recent_chats')
      .insert({
        user_id: userId,
        chat_id: newChatId,
        chat_title: title,
        message_content: message.content,
        sender_type: senderType,
        sender_name: senderName,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error storing chat message:', error);
      return { chatId: newChatId, success: false, error: error.message };
    }
    
    return { chatId: newChatId, success: true };
  } catch (error) {
    console.error('Error in storeChatMessage:', error);
    return { 
      chatId: chatId || '', 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Fetch recent chats for a user
 * Returns unique conversations with their latest message
 */
export const fetchRecentChats = async (userId: string, limit: number = 20): Promise<RecentChat[]> => {
  try {
    // First, get all chats grouped by chat_id, getting the most recent one for each
    const { data, error } = await supabase
      .from('recent_chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit * 5); // Get more records to account for grouping
    
    if (error) {
      console.error('Error fetching recent chats:', error);
      return [];
    }
    
    if (!data) return [];
    
    // Group by chat_id and take the most recent message from each conversation
    const chatMap = new Map<string, RecentChat>();
    
    for (const chat of data) {
      const chatId = chat.chat_id;
      if (!chatMap.has(chatId) || new Date(chat.created_at) > new Date(chatMap.get(chatId)!.created_at)) {
        chatMap.set(chatId, chat as RecentChat);
      }
    }
    
    // Convert map to array and sort by most recent
    const recentChats = Array.from(chatMap.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
    
    return recentChats;
  } catch (error) {
    console.error('Error in fetchRecentChats:', error);
    return [];
  }
};

/**
 * Fetch all messages for a specific chat
 */
export const fetchChatMessages = async (userId: string, chatId: string): Promise<RecentChat[]> => {
  try {
    const { data, error } = await supabase
      .from('recent_chats')
      .select('*')
      .eq('user_id', userId)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    
    return data as RecentChat[];
  } catch (error) {
    console.error('Error in fetchChatMessages:', error);
    return [];
  }
};

/**
 * Delete a specific chat conversation
 */
export const deleteChat = async (userId: string, chatId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('recent_chats')
      .delete()
      .eq('user_id', userId)
      .eq('chat_id', chatId);
    
    if (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteChat:', error);
    return false;
  }
};
