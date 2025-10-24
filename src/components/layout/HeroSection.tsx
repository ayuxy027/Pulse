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
    <div
        style={{
            width: 405,
            height: 84,
            position: 'relative',
            top: 90,
            left: 43,
            opacity: 1,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: 0,
        }}
    >
        <h1
            style={{
                width: 405,
                height: 42,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontStyle: 'normal',
                fontSize: 32,
                lineHeight: '42px',
                letterSpacing: '-0.75px',
                color: '#0A0C11',
                margin: 0,
            }}
        >
            Hello, {userName}
        </h1>
        <p
            style={{
                width: 405,
                height: 42,
                opacity: 1,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontStyle: 'normal',
                fontSize: 32,
                lineHeight: '42px',
                letterSpacing: '-0.75px',
                color: '#8897AE',
                margin: 0,
            }}
        >
            How are your fitness goals today?
        </p>
    </div>
);

export default HeroSection; 