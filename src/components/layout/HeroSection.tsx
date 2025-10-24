import React from 'react';

/**
 * HeroSection - Modern Greeting Section with Enhanced Typography and Spacing
 * 
 * @param userName - The Name of the User to Greet
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
            How are your Fitness Goals Today?
        </p>
        <div className="w-16 h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
    </div>
);

export default HeroSection; 