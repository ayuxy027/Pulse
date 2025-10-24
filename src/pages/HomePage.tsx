import React, { useEffect, useState } from 'react';
import HeroSection from '../components/layout/HeroSection';
import SuggestedSection from '../components/suggested/SuggestedSection';
import HealthStats from '../components/health/HealthStats';
import ChatInput from '../components/chat/ChatInput';
import { fetchCases } from '../services/mockDataService';
import { Case } from '../services/mockDataService';

/**
 * HomePage - Fitness dashboard displaying hero section, suggested items, and health stats
 */
interface HomePageProps {
    sidebarOpen?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ sidebarOpen = true }) => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCases = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedCases = await fetchCases();
                setCases(fetchedCases);
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
        <div className={`flex-1 flex flex-col h-screen bg-gray-50/30 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
            {/* Greeting Section */}
            <div className="px-8 pt-8">
                <HeroSection />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-8 py-6">
                <div className="max-w-7xl mx-auto h-full">
                    <div className="grid grid-cols-12 gap-8 h-full">
                        {/* Left Column - Suggested Items */}
                        <div className="col-span-4">
                            <SuggestedSection />
                        </div>

                        {/* Right Column - Health Stats 3x2 Grid */}
                        <div className="col-span-8">
                            <HealthStats
                                loading={loading}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Input - Positioned to the right with responsive offset based on sidebar state */}
            <div
                className="flex justify-end px-8 pb-4 transition-all duration-500 ease-in-out"
                style={{
                    marginRight: sidebarOpen ? '360px' : '350px' // 360px - (226px - 64px) = 198px
                }}
            >
                <ChatInput />
            </div>
        </div>
    );
};

export default HomePage; 