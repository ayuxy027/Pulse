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
    <div className="flex flex-col space-y-3">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight leading-tight">
            Hello, {userName}
        </h1>
        <p className="text-2xl font-semibold text-gray-600 leading-relaxed">
            How are your fitness goals today?
        </p>
        <div className="w-16 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
    </div>
);

export default HeroSection; 