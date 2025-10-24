import React, { useEffect, useState } from 'react';
import HeroSection from '../components/layout/HeroSection';
import SuggestedSection from '../components/suggested/SuggestedSection';
import CaseCard from '../components/cases/CaseCard';
import ChatInput from '../components/chat/ChatInput';
import { fetchCases } from '../services/mockDataService';
import { Case } from '../services/mockDataService';
import { Priority } from '../types';

/*
* HomePage - Main dashboard page displaying hero section, suggested items, and case cards
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

    const normalizePriority = (value: string): Priority => {
        const lower = (value || '').toLowerCase();
        if (lower === 'high') return 'High';
        if (lower === 'medium') return 'Medium';
        if (lower === 'low') return 'Low';
        return 'Low';
    };


    return (
        <div className={`flex-1 flex flex-col h-screen bg-gray-50/30 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
            <HeroSection />

            {/* Content Area */}
            <div className="flex-1">
                <div className="p-8" style={{ marginTop: '80px' }}>
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-12 gap-8">
                            {/* Left Column - Suggested */}
                            <div className="col-span-4" style={{ paddingLeft: '30px' }}>
                                <SuggestedSection />
                            </div>

                            {/* Right Column - Case Cards */}
                            <div className="col-span-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-15">
                                    {loading ? (
                                        <div className="col-span-2">
                                            <p>Loading cases...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="col-span-2">
                                            <p className="text-red-500">Error: {error}</p>
                                        </div>
                                    ) : cases.length > 0 ? (
                                        cases.map((caseItem) => (
                                            <CaseCard
                                                key={caseItem.id}
                                                title={caseItem.title}
                                                priority={normalizePriority(caseItem.priority as unknown as string)}
                                                status={caseItem.status}
                                                description={caseItem.description}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2">
                                            <p>No cases found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
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