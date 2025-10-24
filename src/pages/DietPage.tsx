import React, { useState } from 'react';
import { NutritionSummary, StreakCard, UpcomingTasks, AddTasksForm, CalendarView, RemindersView } from '../components/diet';

/**
 * DietPage - Comprehensive nutrition and diet management interface
 * 
 * Features:
 * - Tab navigation (Overview, Calendar, Reminders)
 * - Nutrition summary with daily stats
 * - Calorie burn tracking
 * - Task management for meal planning
 * - Form for adding diet-related tasks
 */
interface DietPageProps {
    sidebarOpen?: boolean;
}

type TabType = 'overview' | 'calendar' | 'reminders';

const DietPage: React.FC<DietPageProps> = ({ sidebarOpen = true }) => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    return (
        <div className={`flex-1 flex flex-col h-screen bg-[#f8f6f1] transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
            {/* Header Section */}
            <div className="p-[30px]">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-1 mb-6">
                        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                            Diet & Nutrition
                        </h1>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-1 inline-flex gap-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'overview'
                                    ? 'bg-gray-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('calendar')}
                            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'calendar'
                                    ? 'bg-gray-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={() => setActiveTab('reminders')}
                            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'reminders'
                                    ? 'bg-gray-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            Reminders
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-[30px] overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Left Column - Nutrition & Tasks */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* Streak Cards Row */}
                                <div className="grid grid-cols-3 gap-4">
                                    <StreakCard
                                        type="water"
                                        streakCount={7}
                                        todayProgress={75}
                                        target="8 glasses"
                                    />
                                    <StreakCard
                                        type="sleep"
                                        streakCount={5}
                                        todayProgress={88}
                                        target="8 hours"
                                    />
                                    <StreakCard
                                        type="diet"
                                        streakCount={12}
                                        todayProgress={92}
                                        target="Daily goals"
                                    />
                                </div>

                                {/* Nutrition Summary Card - Placeholder */}
                                <NutritionSummary />

                                {/* Upcoming Tasks - Placeholder */}
                                <UpcomingTasks />
                            </div>

                            {/* Right Column - Add Tasks Form */}
                            <div className="lg:col-span-5">
                                <AddTasksForm />
                            </div>
                        </div>
                    )}

                    {activeTab === 'calendar' && (
                        <CalendarView />
                    )}

                    {activeTab === 'reminders' && (
                        <RemindersView />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DietPage;
