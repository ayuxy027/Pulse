import React from 'react';
import { Activity, Droplets, Utensils, Target, Heart, Zap, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

// Redesigned chart components with proper frames and sizing
const BMITrendChart = ({ bmi }: { bmi: number }) => {
  // Generate trend data based on BMI (simulate 7-day trend)
  const trendData = [bmi - 0.3, bmi - 0.1, bmi + 0.1, bmi - 0.2, bmi + 0.2, bmi + 0.4, bmi];
  const maxBMI = Math.max(...trendData);
  const minBMI = Math.min(...trendData);
  const range = maxBMI - minBMI || 1;

  return (
    <div className="w-full h-20 bg-gray-50 rounded-lg border border-gray-200 p-3">
      <div className="flex items-end justify-between h-full space-x-1">
        {trendData.map((value, i) => {
          const height = ((value - minBMI) / range) * 0.7 + 0.3; // 30% to 100% height
          return (
            <div
              key={i}
              className="bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-md flex-1"
              style={{ height: `${height * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

const WaterIntakeChart = ({ current, goal }: { current: number; goal: number }) => {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="w-full h-20 bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-gray-600"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{Math.round(percentage)}%</span>
        </div>
      </div>
    </div>
  );
};

const CaloriesChart = ({ current, goal }: { current: number; goal: number }) => {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="w-full h-20 bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-gray-600"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{Math.round(percentage)}%</span>
        </div>
      </div>
    </div>
  );
};

const StepsChart = ({ current, goal }: { current: number; goal: number }) => {
  const percentage = Math.min((current / goal) * 100, 100);

  return (
    <div className="w-full h-20 bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-gray-500"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${percentage}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{Math.round(percentage)}%</span>
        </div>
      </div>
    </div>
  );
};

interface HealthStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  size: 'small' | 'medium' | 'large';
  chart?: React.ComponentType;
}

const HealthStatCard: React.FC<HealthStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  size,
  chart: Chart
}) => {
  return (
    <div className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 bg-white rounded-xl border border-gray-100 hover:border-gray-200 overflow-hidden">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 ${color}`}>
              <Icon size={16} className="text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                {title}
              </h4>
            </div>
          </div>
          <div className="flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors">
            <span>View Details</span>
            <ArrowUpRight size={12} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <div className="text-2xl font-bold text-gray-900 tracking-tight">
              {value}
            </div>
            {subtitle && (
              <p className="text-gray-600 text-xs leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Chart - dedicated frame */}
          {Chart && (
            <div className="flex-1">
              <Chart />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface HealthStatsProps {
  loading?: boolean;
  error?: string | null;
}

const HealthStats: React.FC<HealthStatsProps> = ({ loading, error }) => {
  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Section Header */}
        <div className="space-y-1 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Health Overview
          </h2>
          <div className="w-10 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
        </div>

        {/* Loading Cards */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-12 bg-gray-200 rounded mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col space-y-4">
        {/* Section Header */}
        <div className="space-y-1 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Health Overview
          </h2>
          <div className="w-10 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 text-center flex items-center justify-center">
          <p className="text-red-500 text-sm">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Section Header */}
      <div className="space-y-1 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Health Overview
        </h2>
        <div className="w-10 h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
      </div>

      {/* Health Stats Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <HealthStatCard
          title="BMI"
          value="22.5"
          subtitle="Normal"
          icon={Activity}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          size="small"
          chart={() => <BMITrendChart bmi={22.5} />}
        />
        <HealthStatCard
          title="Water Intake"
          value="2.5L"
          subtitle="Goal: 2.5L"
          icon={Droplets}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          size="small"
          chart={() => <WaterIntakeChart current={2.5} goal={2.5} />}
        />
        <HealthStatCard
          title="Calories"
          value="2,200"
          subtitle="Goal: 2,000"
          icon={Utensils}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          size="small"
          chart={() => <CaloriesChart current={2200} goal={2000} />}
        />
        <HealthStatCard
          title="Steps"
          value="8,432"
          subtitle="Goal: 10,000"
          icon={Target}
          color="bg-gradient-to-br from-green-500 to-green-600"
          size="small"
          chart={() => <StepsChart current={8432} goal={10000} />}
        />
      </div>
    </div>
  );
};

export default HealthStats;
