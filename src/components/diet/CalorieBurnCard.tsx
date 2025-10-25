import React from 'react';
import { Flame, TrendingUp, Clock } from 'lucide-react';

/**
 * CalorieBurnCard - Enhanced card for displaying meal-based calorie information
 * Shows calories burned/consumed with additional details and trends
 */
interface CalorieBurnCardProps {
    mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
    calories: number;
    time?: string;
    trend?: 'up' | 'down' | 'stable';
    items?: string[];
    color?: 'orange' | 'red' | 'amber' | 'yellow';
}

const CalorieBurnCard: React.FC<CalorieBurnCardProps> = ({
    mealType,
    calories,
    time,
    trend = 'stable',
    items = [],
    color = 'orange'
}) => {
    // Color gradients for different meal types
    const colorSchemes = {
        orange: {
            gradient: 'from-orange-500 to-red-500',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-600'
        },
        red: {
            gradient: 'from-red-500 to-rose-600',
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-600'
        },
        amber: {
            gradient: 'from-amber-500 to-orange-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            text: 'text-amber-600'
        },
        yellow: {
            gradient: 'from-yellow-500 to-amber-500',
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-600'
        }
    };

    const scheme = colorSchemes[color];

    return (
        <div className={`group cursor-pointer bg-white rounded-xl border border-gray-100 hover:${scheme.border} hover:shadow-xl transition-all duration-300 overflow-hidden`}>
            {/* Top Section - Flame Icon and Calories */}
            <div className="p-6 flex flex-col items-center gap-4">
                {/* Flame Icon */}
                <div className={`relative p-4 rounded-xl bg-linear-to-br ${scheme.gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Flame size={32} className="text-white" />

                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 rounded-xl bg-linear-to-br ${scheme.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`}></div>
                </div>

                {/* Calories */}
                <div className="text-center">
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-gray-900">
                            {calories}
                        </span>
                        <span className="text-sm font-medium text-gray-500">kcal</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 mt-1">
                        {mealType}
                    </p>
                </div>

                {/* Time and Trend Indicator */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {time && (
                        <div className="flex items-center gap-1">
                            <Clock size={12} />
                            <span>{time}</span>
                        </div>
                    )}
                    {trend !== 'stable' && (
                        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <TrendingUp
                                size={12}
                                className={trend === 'down' ? 'rotate-180' : ''}
                            />
                            <span className="font-medium">
                                {trend === 'up' ? '+5%' : '-3%'}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section - Meal Items (visible on hover) */}
            {items.length > 0 && (
                <div className="px-4 pb-4 max-h-0 group-hover:max-h-40 overflow-hidden transition-all duration-300">
                    <div className={`pt-4 border-t border-gray-100 space-y-2`}>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Items:</p>
                        {items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${scheme.bg} ${scheme.text}`}></div>
                                <span className="text-xs text-gray-600">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalorieBurnCard;
