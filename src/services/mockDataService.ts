// Mock data service to replace Supabase functionality

// Define types for our data
export interface Case {
  id: number
  title: string
  priority: string
  status: string
  description: string
  created_at: string
  updated_at: string
}

export interface SuggestedItem {
  id: number
  title: string
  subtitle: string
  type: string
  created_at: string
}

export interface ChatConversation {
  id: number
  title: string
  last_message: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: number
  title: string
  type: string
  size: string
  created_at: string
}

// Mock data
const mockCases: Case[] = [
  {
    id: 1,
    title: "BMI Tracking - Weight Management",
    priority: "high",
    status: "in_progress",
    description: "Monitor BMI progress and adjust diet plan for optimal health goals",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z"
  },
  {
    id: 2,
    title: "Water Intake - Hydration Goals",
    priority: "medium",
    status: "pending",
    description: "Track daily water consumption and maintain 2.5L hydration target",
    created_at: "2024-01-18T09:15:00Z",
    updated_at: "2024-01-18T09:15:00Z"
  }
];

const mockSuggestedItems: SuggestedItem[] = [
  {
    id: 1,
    title: "AI Intelligence",
    subtitle: "Latest insights and recommendations",
    type: "ai",
    created_at: "2024-01-20T10:00:00Z"
  },
  {
    id: 2,
    title: "Nutrition Tracker",
    subtitle: "Track calories, macros, and meal planning",
    type: "tool",
    created_at: "2024-01-19T14:30:00Z"
  },
  {
    id: 3,
    title: "Workout Planner",
    subtitle: "Personalized exercise routines and schedules",
    type: "workout",
    created_at: "2024-01-18T16:45:00Z"
  },
  {
    id: 4,
    title: "Health Analytics",
    subtitle: "Comprehensive health metrics and trends",
    type: "analytics",
    created_at: "2024-01-17T12:20:00Z"
  }
];

const mockChatConversations: ChatConversation[] = [
  {
    id: 1,
    title: "BMI Analysis Discussion",
    last_message: "Your BMI is in the normal range, but we should focus on muscle building.",
    created_at: "2024-01-20T10:30:00Z",
    updated_at: "2024-01-20T15:45:00Z"
  },
  {
    id: 2,
    title: "Nutrition Planning",
    last_message: "Can you help me create a meal plan for weight loss?",
    created_at: "2024-01-19T14:20:00Z",
    updated_at: "2024-01-19T16:30:00Z"
  },
  {
    id: 3,
    title: "Workout Strategy",
    last_message: "We need to increase your cardio sessions to meet your fitness goals.",
    created_at: "2024-01-18T11:15:00Z",
    updated_at: "2024-01-18T13:20:00Z"
  }
];

const mockDocuments: Document[] = [
  {
    id: 1,
    title: "BMI Calculator Guide",
    type: "pdf",
    size: "2.4 MB",
    created_at: "2024-01-20T10:00:00Z"
  },
  {
    id: 2,
    title: "Nutrition Plan 2024",
    type: "pdf",
    size: "1.8 MB",
    created_at: "2024-01-19T14:30:00Z"
  },
  {
    id: 3,
    title: "Workout Guidelines",
    type: "docx",
    size: "856 KB",
    created_at: "2024-01-18T16:45:00Z"
  },
  {
    id: 4,
    title: "Health Metrics Checklist",
    type: "pdf",
    size: "1.2 MB",
    created_at: "2024-01-17T09:20:00Z"
  }
];

// Mock service functions
export const fetchCases = async (): Promise<Case[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockCases;
};

export const fetchSuggestedItems = async (): Promise<SuggestedItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockSuggestedItems;
};

export const fetchChatConversations = async (): Promise<ChatConversation[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockChatConversations;
};

export const fetchDocuments = async (): Promise<Document[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 350));
  return mockDocuments;
};
