import React from 'react';

/**
 * HeroSection - Modern greeting section with enhanced typography and spacing
 * 
 * @param userName - The name of the user to greet
 */
interface HeroSectionProps {
    userName?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ userName = "Toni" }) => (
    <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Hello, {userName}
        </h1>
        <p className="text-lg font-medium text-gray-600 leading-relaxed">
            How are your fitness goals today?
        </p>
        <div className="w-12 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
    </div>
);

export default HeroSection; 