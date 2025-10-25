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

// Mock service functions
export const fetchCases = async (): Promise<Case[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockCases;
};
