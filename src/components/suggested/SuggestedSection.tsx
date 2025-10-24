import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowUpRight, TrendingUp, Target, Zap } from 'lucide-react';
import { fetchSuggestedItems } from '../../services/mockDataService';
import { SuggestedItem as SuggestedItemType } from '../../services/mockDataService';

/**
 * SuggestedItem - Modern suggested content item with enhanced styling
 */
interface SuggestedItemProps {
    title: string;
    subtitle: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    count?: number;
    isActive?: boolean;
}

const SuggestedItem: React.FC<SuggestedItemProps> = ({
    title,
    subtitle,
    icon: Icon = ArrowUpRight
}) => (
    <div className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 bg-white rounded-xl border border-gray-100 hover:border-gray-200 overflow-hidden">
        <div className="p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
                            <Icon size={14} className="text-gray-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                            {title}
                        </h4>
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed mb-3">
                        {subtitle}
                    </p>
                    <div className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
                        <span>View Details</span>
                        <ArrowUpRight size={12} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

/**
 * SuggestedSection - Modern suggested content section with enhanced design
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
        <div className="h-full flex flex-col space-y-4">
            {/* Section Header */}
            <div className="space-y-1 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Suggested
                </h2>
                <div className="w-10 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
            </div>

            {/* AI Intelligence Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4 group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
                        <Sparkles size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base mb-1">
                            AI Intelligence
                        </h3>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            Latest insights and recommendations
                        </p>
                    </div>
                </div>
            </div>

            {/* Suggested Items - Scrollable area */}
            <div className="flex-1 overflow-y-auto space-y-3">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                        <p className="text-red-500 text-sm">Error: {error}</p>
                    </div>
                ) : suggestedItems.length > 0 ? (
                    suggestedItems.map((item, index) => (
                        <SuggestedItem
                            key={item.id}
                            title={item.title}
                            subtitle={item.subtitle}
                            icon={[TrendingUp, Target, Zap][index % 3]}
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
                        <p className="text-gray-500 text-sm">No suggested items found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestedSection;