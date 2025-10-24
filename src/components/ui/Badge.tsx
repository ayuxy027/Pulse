import React from 'react';

/**
 * PriorityBadge - Displays priority levels (High/Medium/Low) with color-coded styling
 */
export type Priority = 'High' | 'Medium' | 'Low';

export interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const colors: Record<Priority, string> = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    Low: 'bg-green-50 text-green-700 border-green-200'
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${colors[priority]}`}>
      {priority}
    </span>
  );
};

/**
 * StatusBadge - Displays status information with neutral gray styling
 */
export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
    {status}
  </span>
); 