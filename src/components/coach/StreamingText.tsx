import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StreamingTextProps {
    text: string;
    isComplete: boolean;
    onComplete?: () => void;
}

const StreamingText: React.FC<StreamingTextProps> = ({
    text,
    isComplete,
    onComplete
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        if (text !== displayedText) {
            setDisplayedText(text);
        }
    }, [text, displayedText]);

    useEffect(() => {
        if (isComplete && onComplete) {
            onComplete();
        }
    }, [isComplete, onComplete]);

    // Cursor blinking animation
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <span>{displayedText}</span>
            {!isComplete && (
                <motion.span
                    animate={{ opacity: showCursor ? 1 : 0 }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-0.5 h-4 bg-gray-600 ml-1"
                />
            )}
        </div>
    );
};

export default StreamingText;
