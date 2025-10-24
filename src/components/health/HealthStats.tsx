import React from 'react';
import { Activity, Droplets, Utensils, Target, Heart, Zap, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

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
  return (
    <div
      className="cursor-pointer transition-all duration-200 hover:shadow-sm border-b border-gray-200 hover:border-gray-300 bg-white"
      style={{
        height: 'calc((368px - 65px) / 3)',
        padding: '16px',
      }}
    >
      <div
        className="flex items-start justify-between h-full"
        style={{
          borderLeft: '3px solid #1B4DFF',
          paddingLeft: '16px',
        }}
      >
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon size={16} className="text-white" />
            </div>
            <h4
              className="font-medium leading-tight cursor-pointer"
              style={{
                fontFamily: 'Inter',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '20px',
                letterSpacing: '-0.2px',
                color: '#0A0C11',
                marginBottom: '4px',
              }}
            >
              {title}
            </h4>
          </div>
          <div className="space-y-1">
            <div
              className="font-bold cursor-pointer"
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '24px',
                letterSpacing: '-0.3px',
                color: '#0A0C11',
              }}
            >
              {value}
            </div>
            {subtitle && (
              <p
                className="text-gray-600 leading-relaxed cursor-pointer"
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 300,
                  fontSize: '14px',
                  lineHeight: '22px',
                  letterSpacing: '-0.2px',
                  color: '#6B7280',
                  marginBottom: '0px',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
            <span>View Details</span>
            <ArrowUpRight size={12} />
          </div>
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
      <div className="space-y-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="cursor-pointer transition-all duration-200 hover:shadow-sm border-b border-gray-200 hover:border-gray-300 bg-white animate-pulse"
            style={{
              height: 'calc((368px - 65px) / 3)',
              padding: '16px',
            }}
          >
            <div
              className="flex items-start justify-between h-full"
              style={{
                borderLeft: '3px solid #1B4DFF',
                paddingLeft: '16px',
              }}
            >
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
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
    <div className="space-y-0">
      <HealthStatCard
        title="BMI"
        value="22.5"
        subtitle="Normal"
        icon={Activity}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        size="small"
      />
      <HealthStatCard
        title="Water Intake"
        value="2.5L"
        subtitle="Goal: 2.5L"
        icon={Droplets}
        color="bg-gradient-to-br from-cyan-500 to-cyan-600"
        size="small"
      />
      <HealthStatCard
        title="Calories"
        value="2,200"
        subtitle="Goal: 2,000"
        icon={Utensils}
        color="bg-gradient-to-br from-orange-500 to-orange-600"
        size="small"
      />
      <HealthStatCard
        title="Steps"
        value="8,432"
        subtitle="Goal: 10,000"
        icon={Target}
        color="bg-gradient-to-br from-green-500 to-green-600"
        size="small"
      />
    </div>
  );
};

export default HealthStats;
