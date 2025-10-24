import React from 'react';
import { Droplets, Moon, Target } from 'lucide-react';

/**
 * StreakCard - Display streak tracking for water, sleep, and diet compliance
 * Shows current streak count and progress
 */
interface StreakCardProps {
    type: 'water' | 'sleep' | 'diet';
    streakCount: number;
    todayProgress?: number; // 0-100
    target?: string;
}

const StreakCard: React.FC<StreakCardProps> = ({ type, streakCount, todayProgress = 0, target }) => {
    const getStreakConfig = () => {
        switch (type) {
            case 'water':
                return {
                    icon: Droplets,
                    title: 'Water Intake',
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    progressColor: 'bg-blue-500',
                    target: target || '8 glasses'
                };
            case 'sleep':
                return {
                    icon: Moon,
                    title: 'Sleep Quality',
                    color: 'text-purple-500',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-200',
                    progressColor: 'bg-purple-500',
                    target: target || '8 hours'
                };
            case 'diet':
                return {
                    icon: Target,
                    title: 'Diet Compliance',
                    color: 'text-orange-500',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-200',
                    progressColor: 'bg-orange-500',
                    target: target || 'Daily goals'
                };
        }
    };

    const config = getStreakConfig();
    const Icon = config.icon;

    return (
        <div className={`group relative bg-white rounded-2xl border ${config.borderColor} shadow-sm p-5 hover:shadow-md transition-all duration-200 cursor-pointer`}>
            {/* Icon and Title */}
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${config.bgColor}`}>
                    <Icon size={20} className={config.color} />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900">{config.title}</h4>
                    <p className="text-[10px] text-gray-500">{config.target}</p>
                </div>
            </div>

            {/* Streak Count */}
            <div className="mb-3">
                <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${config.color}`}>{streakCount}</span>
                    <span className="text-sm font-medium text-gray-500">day{streakCount !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Current streak</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-600">Today</span>
                    <span className={`font-semibold ${config.color}`}>{todayProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-full ${config.progressColor} rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${todayProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Hover Overlay - Optional Details */}
            <div className="absolute inset-0 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="h-full flex flex-col justify-center items-center p-5 text-center">
                    <Icon size={32} className={`${config.color} mb-2`} />
                    <p className="text-xs font-semibold text-gray-900 mb-1">Keep it up! 🎉</p>
                    <p className="text-[10px] text-gray-500">
                        {streakCount > 0 ? `${streakCount} day streak` : 'Start your streak today'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StreakCard;
