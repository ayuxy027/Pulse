/**
 * Shared types and interfaces for the Knowlia application
 */

// Priority levels for cases and tasks
export type Priority = 'High' | 'Medium' | 'Low';

// User profile interface
export interface UserProfile {
  name: string;
  role: string;
  avatar?: string;
  email?: string;
}

// Navigation item interface
export interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  isActive?: boolean;
  badge?: React.ReactNode;
  shortcut?: string | null;
  href?: string;
}

// Recent item interface
export interface RecentItem {
  id: string;
  title: string;
  isActive?: boolean;
  timestamp?: Date;
  type?: 'chat' | 'case' | 'analysis';
}

// Suggested item interface
export interface SuggestedItem {
  id: string;
  title: string;
  subtitle: string;
  count?: number;
  isActive?: boolean;
  type?: 'prior-art' | 'analysis' | 'recommendation';
}

// Case interface
export interface Case {
  id: string;
  title: string;
  priority: Priority;
  status: string;
  description: string;
  buttonText?: string;
  createdAt?: Date;
  updatedAt?: Date;
  assignedTo?: UserProfile;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  attachments?: string[];
}

// Component props interfaces
export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface PriorityBadgeProps {
  priority: Priority;
}

export interface StatusBadgeProps {
  status: string;
}

export interface CaseCardProps {
  title: string;
  priority: Priority;
  status: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
}

export interface HeroSectionProps {
  userName?: string;
}

export interface UserProfileProps {
  name: string;
  role: string;
  avatar?: string;
  onClick?: () => void;
}

export interface SuggestedItemProps {
  title: string;
  subtitle: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export interface NavItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  isActive?: boolean;
  badge?: React.ReactNode;
  shortcut?: string | null;
  onClick?: () => void;
}

export interface RecentItemProps {
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

// Export diet types
export * from './diet'; 