import React from 'react';
import { Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { Priority } from '../ui/Badge';

/**
 * CaseCard - Displays individual patent case information with priority badges, status, description, and action button
 * 
 * @param title - The title of the case
 * @param priority - The priority level of the case
 * @param status - The current status of the case
 * @param description - The description of the case
 * @param buttonText - The text to display on the action button
 *
 */
interface CaseCardProps {
  title: string;
  priority: Priority;
  status: string;
  description: string;
  buttonText?: string;
}

const CaseCard: React.FC<CaseCardProps> = ({
  title,
  priority,
  status,
  description,
  buttonText = "Start AI analysis"
}) => (
  <div
    className="bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all duration-300"
    style={{
      width: '384px',
      height: '375px',
      justifyContent: 'space-between',
      opacity: 1,
      borderRadius: '16px',
      borderWidth: '1px',
      borderColor: '#E5E7EB',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      marginTop: '30px',
    }}
  >
    <div style={{ flex: '0 0 auto' }}>
      <div
        style={{
          marginBottom: '16px',
        }}
      >
        <h3
          className="font-semibold text-gray-900 leading-tight"
          style={{
            fontFamily: 'Inter',
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '34px',
            letterSpacing: '-0.4px',
            color: '#0A0C11',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-3">
        <div
          style={{
            height: '24px',
            gap: '2px',
            borderRadius: '12px',
            paddingTop: '2px',
            paddingRight: '8px',
            paddingBottom: '2px',
            paddingLeft: '8px',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter',
            whiteSpace: 'nowrap',
          }}
        >
          {priority}
        </div>
        <div
          style={{
            height: '24px',
            gap: '2px',
            borderRadius: '12px',
            paddingTop: '2px',
            paddingRight: '8px',
            paddingBottom: '2px',
            paddingLeft: '8px',
            borderWidth: '1px',
            borderColor: '#D1D5DB',
            borderStyle: 'solid',
            backgroundColor: 'transparent',
            color: '#6B7280',
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter',
            whiteSpace: 'nowrap',
          }}
        >
          {status}
        </div>
      </div>
    </div>
    <div style={{ flex: '1 1 auto', minHeight: '20px' }}></div>
    <div style={{ flex: '0 0 auto' }}>
      <div
        style={{
          borderRadius: '8px',
          paddingTop: '12px',
          paddingRight: '12px',
          paddingBottom: '12px',
          paddingLeft: '12px',
          backgroundColor: '#FEF3C7',
          marginBottom: '16px',
        }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{
            fontFamily: 'Inter',
            fontSize: '14px',
            lineHeight: '20px',
            color: '#92400E',
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>
      <Button
        className="w-full font-semibold group relative overflow-hidden transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl hover:cursor-pointer"
        type="button"
      >
        <Sparkles
          fill="#fffc"
          size={16}
          className="relative z-10 transition-all duration-300 group-hover:rotate-12"
        />
        <span className="relative z-10 transition-all duration-300 group-hover:text-white">
          {buttonText}
        </span>
        {/* Beautiful gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
      </Button>
    </div>
  </div>
);

export default CaseCard;