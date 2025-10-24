import React from 'react';

interface FitnessCategoryCardProps {
    title: string;
    value: string;
    subtitle?: string;
    onClick?: () => void;
}

const FitnessCategoryCard: React.FC<FitnessCategoryCardProps> = ({
    title,
    value,
    subtitle,
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className="w-full h-24 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 flex flex-col items-center justify-center text-gray-900 shadow-sm"
        >
            <div className="text-lg font-medium">{title}</div>
            <div className="text-sm text-gray-600">{value}</div>
            {subtitle && (
                <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
            )}
        </button>
    );
};

export default FitnessCategoryCard;
