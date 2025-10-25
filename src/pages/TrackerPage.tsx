import React, { useState, useCallback, useMemo } from 'react';
import { CalendarView, RemindersView, DietOverview } from '../components/diet';
import { AddDietEntryForm } from '../components/diet/AddDietEntryForm';
import { Plus, AlertCircle, Utensils, Calendar, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';

/**
 * TrackerPage - Comprehensive nutrition and diet tracking interface
 */
interface TrackerPageProps {
    sidebarOpen?: boolean;
}

type TabType = 'overview' | 'calendar' | 'reminders';

const TrackerPage: React.FC<TrackerPageProps> = () => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleAddSuccess = useCallback(() => {
        // Refresh the data after successful addition
        setRefreshKey(prev => prev + 1);
        setIsAddFormOpen(false);
        setError(null);
    }, []);

    const handleAddError = useCallback((errorMessage: string) => {
        setError(errorMessage);
    }, []);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        setError(null);
    }, []);

    const handleFormOpen = useCallback(() => {
        setIsAddFormOpen(true);
        setError(null);
    }, []);

    const handleFormClose = useCallback(() => {
        setIsAddFormOpen(false);
        setError(null);
    }, []);

    // Memoized tab configuration for accessibility
    const tabConfig = useMemo(() => [
        { id: 'overview', label: 'Overview', ariaLabel: 'View nutrition overview and daily stats' },
        { id: 'calendar', label: 'Calendar', ariaLabel: 'View calendar with diet tracking data' },
        { id: 'reminders', label: 'Reminders', ariaLabel: 'Manage habits and reminders' }
    ], []);

    return (
        <div className="w-full flex flex-col bg-[#f8f6f1] min-h-screen">
            {/* Header Section - Enhanced with animations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="px-6 pt-4 pb-2 shrink-0"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start justify-between mb-6">
                        <div className="space-y-1">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900 leading-tight"
                            >
                                Tracker
                            </motion.h1>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "3rem" }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="h-0.5 bg-linear-to-r from-gray-400 to-gray-600 rounded-full"
                            ></motion.div>
                        </div>
                        {/* Add Diet Entry Button - Only visible in overview tab */}
                        <AnimatePresence>
                            {activeTab === 'overview' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={handleFormOpen}
                                        className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-auto h-auto"
                                        aria-label="Add new diet entry"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Entry
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Error</p>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                                    aria-label="Dismiss error"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tab Navigation - Enhanced */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl text-grey-700 border border-gray-200 shadow-lg p-1 inline-flex gap-2"
                        role="tablist"
                        aria-label="Tracker page navigation tabs"
                    >
                        {tabConfig.map((tab, index) => (
                            <motion.div
                                key={tab.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    onClick={() => handleTabChange(tab.id as TabType)}
                                    variant={activeTab === tab.id ? "primary" : "secondary"}
                                    className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 w-auto h-auto ${activeTab === tab.id
                                        ? 'bg-linear-to-r from-gray-600 to-gray-700 text-white shadow-md'
                                        : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    aria-label={tab.ariaLabel}
                                    tabIndex={activeTab === tab.id ? 0 : -1}
                                >
                                    {tab.id === 'overview' && <Utensils className="w-4 h-4" />}
                                    {tab.id === 'calendar' && <Calendar className="w-4 h-4" />}
                                    {tab.id === 'reminders' && <Bell className="w-4 h-4" />}
                                    {tab.label}
                                </Button>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Content Area - Enhanced */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="px-6 pb-2 flex-1"
                role="tabpanel"
                aria-label={`${activeTab} content`}
            >
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <DietOverview
                                    refreshTrigger={refreshKey}
                                    onError={handleAddError}
                                />
                            </motion.div>
                        )}

                        {activeTab === 'calendar' && (
                            <motion.div
                                key="calendar"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CalendarView />
                            </motion.div>
                        )}

                        {activeTab === 'reminders' && (
                            <motion.div
                                key="reminders"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <RemindersView />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Add Diet Entry Modal */}
            <AddDietEntryForm
                isOpen={isAddFormOpen}
                onClose={handleFormClose}
                onSuccess={handleAddSuccess}
                onError={handleAddError}
            />
        </div>
    );
};

export default TrackerPage;

