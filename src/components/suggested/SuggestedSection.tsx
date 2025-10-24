import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { fetchSuggestedItems } from '../../services/mockDataService';
import { SuggestedItem as SuggestedItemType } from '../../services/mockDataService';

/**
 * SuggestedItem - Individual suggested content item with title, subtitle, and view details link
 */
interface SuggestedItemProps {
    title: string;
    subtitle: string;
    count?: number;
    isActive?: boolean;
}

const SuggestedItem: React.FC<SuggestedItemProps> = ({
    title,
    subtitle
}) => (
    <div
        className="cursor-pointer transition-all duration-200 hover:shadow-sm border-b border-gray-200 hover:border-gray-300 bg-white"
        style={{
            height: 'calc((368px - 65px) / 3)',
            padding: '16px',
        }}
    >
        <div
            className="flex items-start justify-between h-full"
            style={{
                borderLeft: '3px solid #1B4DFF',
                paddingLeft: '16px',
            }}
        >
            <div className="flex-1 flex flex-col justify-center">
                <h4
                    className="font-medium leading-tight cursor-pointer"
                    style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        letterSpacing: '-0.2px',
                        color: '#0A0C11',
                        marginBottom: '4px',
                    }}
                >
                    {title}
                </h4>
                <p
                    className="text-gray-600 leading-relaxed cursor-pointer"
                    style={{
                        fontFamily: 'Inter',
                        fontWeight: 300,
                        fontSize: '14px',
                        lineHeight: '22px',
                        letterSpacing: '-0.2px',
                        color: '#6B7280',
                        marginBottom: '0px',
                    }}
                >
                    {subtitle}
                </p>
                <a
                    href="/"
                    className="flex items-center gap-0 hover:text-blue-700 transition-colors font-medium self-start cursor-pointer"
                    style={{
                        fontFamily: 'Inter',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '20px',
                        letterSpacing: '0.2px',
                        color: '#1B4DFF',
                        padding: '0',
                        background: 'none',
                        border: 'none',
                        textDecoration: 'underline',
                    }}
                >
                    <span>View Details</span>
                    <ArrowUpRight size={14} className="text-[#1B4DFF] ml-1" />
                </a>
            </div>
        </div>
    </div>
);

/**
 * SuggestedSection - Main suggested content section with AI intelligence card and list of suggested items
 */
const SuggestedSection: React.FC = () => {
    const [suggestedItems, setSuggestedItems] = useState<SuggestedItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSuggestedItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedItems = await fetchSuggestedItems();
                setSuggestedItems(fetchedItems);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load suggested items');
                console.error('Error loading suggested items:', err);
            } finally {
                setLoading(false);
            }
        };

        loadSuggestedItems();
    }, []);

    return (
        <div style={{ marginLeft: '20px' }}>
            {/* Suggested Title */}
            <h2
                className="font-bold text-gray-900"
                style={{
                    fontFamily: 'Inter',
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '24px',
                    color: '#0A0C11',
                    marginBottom: '8px',
                }}
            >
                Suggested
            </h2>

            {/* Main Card Container - Fixed height to match CaseCards */}
            <div
                style={{
                    height: '368px',
                    borderRadius: '16px',
                    borderWidth: '1px',
                    borderColor: '#E5E7EB',
                    borderStyle: 'solid',
                    background: 'white',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* AI Intelligence Card */}
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    style={{
                        padding: '16px',
                        background: '#F8FAFC',
                        borderBottom: '1px solid #E5E7EB',
                        flexShrink: 0,
                    }}
                >
                    <Sparkles
                        size={20}
                        className="text-[#1B38603D] flex-shrink-0 bg-white"
                    />
                    <div>
                        <h3
                            className="font-semibold text-gray-900"
                            style={{
                                fontFamily: 'Inter',
                                fontSize: '14px',
                                fontWeight: 600,
                                lineHeight: '24px',
                                color: '#0A0C11',
                                margin: 0,
                            }}
                        >
                            AI Intelligence
                        </h3>
                        <p
                            className="text-gray-600"
                            style={{
                                fontFamily: 'Inter',
                                fontWeight: 400,
                                fontSize: '14px',
                                lineHeight: '22px',
                                letterSpacing: '-0.2px',
                                color: '#6B7280',
                                margin: 0,
                            }}
                        >
                            Latest insights and recommendations
                        </p>
                    </div>
                </div>

                {/* Suggested Items Container - Takes remaining space */}
                <div style={{ flex: '1 1 auto', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <p>Loading suggested items...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-red-500">Error: {error}</p>
                        </div>
                    ) : suggestedItems.length > 0 ? (
                        suggestedItems.map((item) => (
                            <SuggestedItem
                                key={item.id}
                                title={item.title}
                                subtitle={item.subtitle}
                            />
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p>No suggested items found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuggestedSection;