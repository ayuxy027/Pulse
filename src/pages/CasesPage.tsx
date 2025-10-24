import React from 'react';
import CaseCard from '../components/cases/CaseCard';

/**
 * CasesPage - Case management page displaying all case cards and case-related functionality
 */
interface CasesPageProps {
    sidebarOpen?: boolean;
}

const CasesPage: React.FC<CasesPageProps> = ({ sidebarOpen = true }) => {
    return (
        <div className={`flex-1 flex flex-col h-screen bg-gray-50/30 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
            {/* Header */}
            <div className="px-8 pt-8 pb-6">
                <h1 className="text-3xl font-semibold text-gray-900 mb-2">Cases</h1>
                <p className="text-lg text-gray-600">Manage your patent cases and applications</p>
            </div>

            {/* Cases Grid */}
            <div className="flex-1 px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <CaseCard
                        title="BioTech Protein Synthesis Method"
                        priority="High"
                        status="Office action received"
                        description="Office Action Analysis: Claims 1-5 rejected under 35 USC 103. IBM Patent US11,234,567 cited as primary reference."
                    />
                    <CaseCard
                        title="Wearable Cancer Treatment Device"
                        priority="High"
                        status="Office action received"
                        description="Office Action Analysis: Claims 1-5 rejected under 35 USC 103. IBM Patent US11,234,567 cited as primary reference."
                    />
                    <CaseCard
                        title="Quantum Computing Algorithm"
                        priority="Medium"
                        status="Under review"
                        description="Novel quantum algorithm for optimization problems with potential applications in logistics and finance."
                    />
                </div>
            </div>
        </div>
    );
};

export default CasesPage; 