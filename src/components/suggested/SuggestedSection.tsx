import React from 'react';
import { Sparkles, ArrowUpRight, Camera, Utensils, MessageCircle, BarChart3 } from 'lucide-react';

/**
 * SuggestedItem - Modern Suggested Content Item with Enhanced Styling
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
 * SuggestedSection - Features from KT Document
 */
const SuggestedSection: React.FC = () => {
    const features = [
        {
            id: 1,
            title: "Snap Your Meal",
            subtitle: "Take a Photo of Your Food and Get Instant Nutrition Breakdown, Calories, and Health Verdict",
            icon: Camera
        },
        {
            id: 2,
            title: "Smart Diet Tracking",
            subtitle: "Get Personalized Meal Recommendations and Track Your Daily Nutrition Goals Automatically",
            icon: Utensils
        },
        {
            id: 3,
            title: "Health Coach Chat",
            subtitle: "Ask Questions Like 'Can I Eat Pizza Tonight?' and Get Personalized Advice Based on Your Data",
            icon: MessageCircle
        },
        {
            id: 4,
            title: "Your Health Dashboard",
            subtitle: "Track Streaks, Earn Badges, and See Your Immunity Score Improve with Daily Habits",
            icon: BarChart3
        }
    ];

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Section Header */}
            <div className="space-y-1 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    Features
                </h2>
                <div className="w-10 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
            </div>

            {/* Daily Health Tip Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4 group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
                        <Sparkles size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base mb-1">
                            Today's Health Tip
                        </h3>
                        <p className="text-gray-600 text-xs leading-relaxed">
                            "Drink a Glass of Water Before Each Meal to Help with Portion Control and Digestion"
                        </p>
                    </div>
                </div>
            </div>

            {/* Features List - Infinite Marquee */}
            <div className="flex-1 overflow-hidden">
                <div className="marquee-container">
                    <div className="marquee-content space-y-3">
                        {features.map((feature) => (
                            <SuggestedItem
                                key={feature.id}
                                title={feature.title}
                                subtitle={feature.subtitle}
                                icon={feature.icon}
                            />
                        ))}
                        {/* Duplicate for seamless loop */}
                        {features.map((feature) => (
                            <SuggestedItem
                                key={`duplicate-${feature.id}`}
                                title={feature.title}
                                subtitle={feature.subtitle}
                                icon={feature.icon}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuggestedSection;