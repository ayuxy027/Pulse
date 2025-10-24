import React, { useEffect, useState } from 'react';
import HeroSection from '../components/layout/HeroSection';
import SuggestedSection from '../components/suggested/SuggestedSection';
import HealthStats from '../components/health/HealthStats';
import ChatInput from '../components/chat/ChatInput';
import { fetchCases } from '../services/mockDataService';

/**
 * HomePage - Modern Fitness Dashboard with Clean, Aesthetic Design
 */
interface HomePageProps {
    sidebarOpen?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ sidebarOpen = true }) => {
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
        <div className={`flex-1 flex flex-col h-screen bg-gradient-to-br from-slate-50 to-gray-50 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
            {/* Hero Section - Compact */}
            <div className="px-8 pt-6 pb-4">
                <div className="max-w-7xl mx-auto">
                    <HeroSection />
                </div>
            </div>

            {/* Main Content Area - Optimized for viewport */}
            <div className="flex-1 px-8 pb-4 overflow-hidden">
                <div className="max-w-7xl mx-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                        {/* Left Column - Suggested Items */}
                        <div className="lg:col-span-5 h-full overflow-hidden">
                            <SuggestedSection />
                        </div>

                        {/* Right Column - Health Stats */}
                        <div className="lg:col-span-7 h-full overflow-hidden">
                            <HealthStats
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Input - Fixed at bottom */}
            <div className="px-8 pb-4 flex-shrink-0">
                <div className="max-w-7xl mx-auto">
                    <div
                        className="flex justify-end transition-all duration-500 ease-in-out"
                        style={{
                            marginRight: sidebarOpen ? '360px' : '350px'
                        }}
                    >
                        <ChatInput />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage; 