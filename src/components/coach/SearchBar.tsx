import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { ChatConversation } from '../../services/mockDataService';
import { searchChatConversations, getSearchSuggestions, highlightSearchTerms, SearchResult } from '../../services/searchService';

interface SearchBarProps {
    conversations: ChatConversation[];
    onSearchResults: (results: SearchResult[]) => void;
    placeholder?: string;
    className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    conversations,
    onSearchResults,
    placeholder = "Search chats",
    className = ""
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);

    // Handle search input changes
    const handleSearchChange = (value: string) => {
        setQuery(value);

        // Get search suggestions
        const newSuggestions = getSearchSuggestions(conversations, value);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0 && value.length >= 2);

        // Perform search and update results
        const results = searchChatConversations(conversations, value);
        onSearchResults(results);
    };



    // Handle suggestion selection
    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        const results = searchChatConversations(conversations, suggestion);
        onSearchResults(results);
    };

    // Clear search
    const handleClearSearch = () => {
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
        const results = searchChatConversations(conversations, '');
        onSearchResults(results);
    };

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => {
                        if (suggestions.length > 0 && query.length >= 2) {
                            setShowSuggestions(true);
                        }
                    }}
                    placeholder={placeholder}
                    className="w-64 pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                />
                {query && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    <div className="px-3 py-2 border-b border-gray-100">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suggestions</span>
                    </div>
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                        >
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span
                                className="font-medium"
                                dangerouslySetInnerHTML={{
                                    __html: highlightSearchTerms(suggestion, query)
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}


        </div>
    );
};

export default SearchBar;

