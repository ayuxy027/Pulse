import React from 'react';

/**
 * HeroSection - Main greeting section displaying personalized welcome message and help prompt
 * 
 * @param userName - The name of the user to greet
 */
interface HeroSectionProps {
    userName?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ userName = "Toni" }) => (
    <div className="flex flex-col">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Hello, {userName}
        </h1>
        <p className="text-2xl font-semibold text-gray-600">
            How are your fitness goals today?
        </p>
    </div>
);

export default HeroSection; 