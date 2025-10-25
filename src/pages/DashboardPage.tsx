import React, { useEffect, useState } from 'react';
import HeroSection from '../components/layout/HeroSection';
import SuggestedSection from '../components/suggested/SuggestedSection';
import HealthStats from '../components/health/HealthStats';
import ChatInput from '../components/coach/ChatInput';
import { fetchCases } from '../services/mockDataService';

/**
 * DashboardPage - Modern Fitness Dashboard with Clean, Aesthetic Design
 */
const DashboardPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCases = async () => {
            try {
                setLoading(true);
                setError(null);
                await fetchCases();
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load cases');
                console.error('Error loading cases:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCases();
    }, []);

    return (
        <div className="w-full flex flex-col bg-[#f8f6f1] min-h-screen">
            {/* Hero Section - Compact */}
            <div className="px-6 pt-4 pb-2 flex-shrink-0">
                <div className="max-w-7xl mx-auto">
                    <HeroSection />
                </div>
            </div>

            {/* Main Content Area - Dynamic scrolling */}
            <div className="px-6 pb-2">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Left Column - Suggested Items with Marquee */}
                        <div className="lg:col-span-5 p-3">
                            <SuggestedSection />
                        </div>

                        {/* Right Column - Health Stats */}
                        <div className="lg:col-span-7 p-3">
                            <HealthStats
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Input - Fixed at bottom */}
            <div className="px-6 pb-4 flex-shrink-0 bg-[#f8f6f1]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center">
                        <ChatInput />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage; 