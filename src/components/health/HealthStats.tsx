import React from 'react';
import { Activity, Droplets, Utensils, Target, Heart, Zap, TrendingUp, Calendar } from 'lucide-react';

interface HealthStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  size: 'small' | 'medium' | 'large';
}

const HealthStatCard: React.FC<HealthStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  size
}) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2'
  };

  return (
    <div className={`${sizeClasses[size]} bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <span className="text-xs text-gray-500 font-medium">{title}</span>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && (
          <div className="text-sm text-gray-600">{subtitle}</div>
        )}
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
      <div className="grid grid-cols-4 gap-4 h-96">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 h-96">
      {/* Row 1 */}
      <HealthStatCard
        title="BMI"
        value="22.5"
        subtitle="Normal"
        icon={Activity}
        color="bg-blue-500"
        size="small"
      />
      <HealthStatCard
        title="Water Intake"
        value="2.5L"
        subtitle="Goal: 2.5L"
        icon={Droplets}
        color="bg-cyan-500"
        size="small"
      />
      <HealthStatCard
        title="Calories"
        value="2,200"
        subtitle="Goal: 2,000"
        icon={Utensils}
        color="bg-orange-500"
        size="small"
      />
      <HealthStatCard
        title="Steps"
        value="8,432"
        subtitle="Goal: 10,000"
        icon={Target}
        color="bg-green-500"
        size="small"
      />
      
      {/* Row 2 */}
      <HealthStatCard
        title="Heart Rate"
        value="72 BPM"
        subtitle="Resting"
        icon={Heart}
        color="bg-red-500"
        size="small"
      />
      <HealthStatCard
        title="Workout"
        value="45 min"
        subtitle="Strength Training"
        icon={Zap}
        color="bg-purple-500"
        size="small"
      />
      <HealthStatCard
        title="Weight"
        value="70.2 kg"
        subtitle="+0.3 kg this week"
        icon={TrendingUp}
        color="bg-indigo-500"
        size="small"
      />
      <HealthStatCard
        title="Sleep"
        value="7.5h"
        subtitle="Last night"
        icon={Calendar}
        color="bg-pink-500"
        size="small"
      />
    </div>
  );
};

export default HealthStats;
