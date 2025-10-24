import React from 'react';

/**
 * NutritionSummary - Displays daily nutrition stats with circular progress chart
 * Shows Fiber, Carbs, and Protein intake vs goals
 */
interface NutritionData {
    fiber: { current: number; goal: number; unit: string };
    carbs: { current: number; goal: number; unit: string };
    protein: { current: number; goal: number; unit: string };
}

interface NutritionSummaryProps {
    data?: NutritionData;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({ data }) => {
    // Default nutrition data
    const nutritionData: NutritionData = data || {
        fiber: { current: 22, goal: 30, unit: 'g' },
        carbs: { current: 180, goal: 250, unit: 'g' },
        protein: { current: 95, goal: 120, unit: 'g' }
    };

    // Calculate total percentage for the main circle
    const calculatePercentage = (current: number, goal: number) => {
        return Math.min((current / goal) * 100, 100);
    };

    const fiberPercentage = calculatePercentage(nutritionData.fiber.current, nutritionData.fiber.goal);
    const carbsPercentage = calculatePercentage(nutritionData.carbs.current, nutritionData.carbs.goal);
    const proteinPercentage = calculatePercentage(nutritionData.protein.current, nutritionData.protein.goal);
    
    // Calculate average percentage for main display
    const averagePercentage = Math.round((fiberPercentage + carbsPercentage + proteinPercentage) / 3);

    // SVG circle parameters
    const size = 180;
    const strokeWidth = 16;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Nutrition Summary
                </h3>
                <span className="text-sm font-medium text-gray-500">Daily Stats</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Side - Circular Progress Chart */}
                <div className="flex items-center justify-center">
                    <div className="relative">
                        <svg width={size} height={size} className="transform -rotate-90">
                            {/* Background circle */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke="#f3f4f6"
                                strokeWidth={strokeWidth}
                            />
                            
                            {/* Progress circle with solid orange color */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke="#f97316"
                                strokeWidth={strokeWidth}
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (circumference * averagePercentage) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        
                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-4xl font-bold text-gray-900">
                                {averagePercentage}%
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Daily Goal
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Nutrition Stats */}
                <div className="flex flex-col justify-center space-y-6">
                    {/* Fiber */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm font-semibold text-gray-900">Fiber</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                                {nutritionData.fiber.current}{nutritionData.fiber.unit} / {nutritionData.fiber.goal}{nutritionData.fiber.unit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${fiberPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Carbs */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-semibold text-gray-900">Carbs</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                                {nutritionData.carbs.current}{nutritionData.carbs.unit} / {nutritionData.carbs.goal}{nutritionData.carbs.unit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${carbsPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Protein */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="text-sm font-semibold text-gray-900">Protein</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                                {nutritionData.protein.current}{nutritionData.protein.unit} / {nutritionData.protein.goal}{nutritionData.protein.unit}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${proteinPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Footer */}
            <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Total Calories</p>
                        <p className="text-lg font-bold text-gray-900">1,850</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Goal</p>
                        <p className="text-lg font-bold text-gray-900">2,200</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Remaining</p>
                        <p className="text-lg font-bold text-green-600">350</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NutritionSummary;
