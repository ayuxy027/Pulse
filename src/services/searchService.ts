import { ChatConversation } from './supabaseService';

/**
 * SearchService - Handles search functionality for chats and conversations
 */

export interface SearchResult {
  id: number;
  title: string;
  last_message: string;
  time_ago: string;
  created_at: string;
  matchType: 'title' | 'none';
  relevanceScore: number;
}

/**
 * Search chat conversations by title or message content
 * @param conversations - Array of chat conversations to search through
 * @param query - Search query string
 * @returns Filtered and sorted search results
 */
export const searchChatConversations = (
  conversations: ChatConversation[],
  query: string
): SearchResult[] => {
  if (!query.trim()) {
    return conversations.map(conv => ({
      ...conv,
      matchType: 'none' as const,
      relevanceScore: 0
    }));
  }

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  conversations.forEach(conversation => {
    const titleMatch = conversation.title.toLowerCase().includes(searchTerm);
    
    if (titleMatch) {
      let relevanceScore = 0;
      const matchType: 'title' | 'none' = 'title';

      // Calculate relevance score for title matches only
      relevanceScore += 10;
      // Bonus for exact title match
      if (conversation.title.toLowerCase() === searchTerm) {
        relevanceScore += 5;
      }
      // Bonus for title starting with search term
      if (conversation.title.toLowerCase().startsWith(searchTerm)) {
        relevanceScore += 3;
      }

      results.push({
        ...conversation,
        matchType,
        relevanceScore
      });
    }
  });

  // Sort by relevance score (highest first), then by creation date (newest first)
  return results.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

/**
 * Highlight search terms in text
 * @param text - Original text
 * @param query - Search query
 * @returns Text with highlighted search terms
 */
export const highlightSearchTerms = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  const searchTerm = query.toLowerCase();
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  
  return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
};

/**
 * Get search suggestions based on conversation titles and messages
 * @param conversations - Array of chat conversations
 * @param query - Partial search query
 * @returns Array of search suggestions
 */
export const getSearchSuggestions = (
  conversations: ChatConversation[],
  query: string
): string[] => {
  if (!query.trim() || query.length < 2) return [];

  const searchTerm = query.toLowerCase();
  const suggestions = new Set<string>();

  conversations.forEach(conversation => {
    // Add title words that start with the search term
    const titleWords = conversation.title.toLowerCase().split(/\s+/);
    titleWords.forEach(word => {
      if (word.startsWith(searchTerm) && word.length > searchTerm.length) {
        suggestions.add(word);
      }
    });
  });

  return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
};
