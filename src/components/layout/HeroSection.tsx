import React from 'react';
import { useSession } from '@supabase/auth-helpers-react';

/**
 * HeroSection - Modern Greeting Section with Enhanced Typography and Spacing
 */
const HeroSection: React.FC = () => {
    const session = useSession();
    const userName = session?.user?.user_metadata?.full_name ||
        session?.user?.email?.split('@')[0] ||
        'there';

    return (
        <div className="flex flex-col space-y-3">
            <h1 className="text-5xl font-bold text-gray-900 tracking-tight leading-tight">
                Hello, {userName}
            </h1>
            <p className="text-2xl font-semibold text-gray-600 leading-relaxed">
                How are your Fitness Goals Today?
            </p>
            <div className="w-16 h-1 bg-linear-to-r from-gray-300 to-gray-400 rounded-full"></div>
        </div>
    );
};

export default HeroSection; 