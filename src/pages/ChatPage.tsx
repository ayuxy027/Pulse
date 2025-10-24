import React, { useEffect, useState } from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import ChatHeader from '../components/chat/ChatHeader';
import { Plus, FileText, MoreVertical } from 'lucide-react';
import { fetchDocuments, fetchChatConversations } from '../services/mockDataService';
import { Document, ChatConversation } from '../services/mockDataService';
import { SearchResult } from '../services/searchService';

/**
 * ChatPage - Clean chat interface with proper layout and design principles
 */
const ChatPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [fetchedDocuments, fetchedConversations] = await Promise.all([
                    fetchDocuments(),
                    fetchChatConversations()
                ]);

                setDocuments(fetchedDocuments);
                setConversations(fetchedConversations);

                const initialResults = fetchedConversations.map(conv => ({
                    ...conv,
                    matchType: 'none' as const,
                    relevanceScore: 0
                }));
                setSearchResults(initialResults);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSearchResults = (results: SearchResult[]) => {
        setSearchResults(results);
        const hasActiveSearch = results.some(result => result.relevanceScore > 0);
        setIsSearching(hasActiveSearch);
    };

    return (
        <div className="h-[calc(100vh-80px)] w-screen bg-[#f8f6f1] flex flex-col overflow-hidden">
            <ChatHeader
                conversations={conversations}
                onSearchResults={handleSearchResults}
            />
            <div className="flex-1 flex gap-6 p-6 min-h-0">
                <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <ChatInterface
                        searchResults={searchResults}
                        isSearching={isSearching}
                        conversations={conversations}
                        loading={loading}
                        error={error}
                    />
                </div>
                <div className="w-80 bg-white rounded-lg border border-gray-200 shadow-sm flex-shrink-0">
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Project Knowledge</h2>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600">10% of Project Capacity Used</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-900">Documents</h3>
                                <span className="text-sm text-gray-500">{documents.length}</span>
                            </div>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p>Loading documents...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-red-500">Error: {error}</p>
                                    </div>
                                ) : documents.length > 0 ? (
                                    documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                        >
                                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${doc.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'
                                                }`}>
                                                <FileText size={16} className={doc.type === 'pdf' ? 'text-red-600' : 'text-blue-600'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {doc.title}
                                                </p>
                                                <p className="text-xs text-gray-500">{doc.size}</p>
                                            </div>
                                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p>No documents found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;