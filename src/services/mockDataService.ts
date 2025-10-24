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
    title: "Contract Review - TechCorp Partnership",
    priority: "high",
    status: "in_progress",
    description: "Review partnership agreement with TechCorp for new product collaboration",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z"
  },
  {
    id: 2,
    title: "Employment Law Compliance",
    priority: "medium",
    status: "pending",
    description: "Update employee handbook to comply with new labor regulations",
    created_at: "2024-01-18T09:15:00Z",
    updated_at: "2024-01-18T09:15:00Z"
  }
];

const mockSuggestedItems: SuggestedItem[] = [
  {
    id: 1,
    title: "Contract Templates",
    subtitle: "Standard legal document templates",
    type: "template",
    created_at: "2024-01-20T10:00:00Z"
  },
  {
    id: 2,
    title: "Legal Research Tools",
    subtitle: "Access to legal databases and research",
    type: "tool",
    created_at: "2024-01-19T14:30:00Z"
  },
  {
    id: 3,
    title: "Compliance Checklist",
    subtitle: "Step-by-step compliance verification",
    type: "checklist",
    created_at: "2024-01-18T16:45:00Z"
  }
];

const mockChatConversations: ChatConversation[] = [
  {
    id: 1,
    title: "Contract Analysis Discussion",
    last_message: "The contract terms look favorable, but we should negotiate the termination clause.",
    created_at: "2024-01-20T10:30:00Z",
    updated_at: "2024-01-20T15:45:00Z"
  },
  {
    id: 2,
    title: "Employment Law Questions",
    last_message: "Can you help me understand the new overtime regulations?",
    created_at: "2024-01-19T14:20:00Z",
    updated_at: "2024-01-19T16:30:00Z"
  }
];

const mockDocuments: Document[] = [
  {
    id: 1,
    title: "Partnership Agreement Template",
    type: "pdf",
    size: "2.4 MB",
    created_at: "2024-01-20T10:00:00Z"
  },
  {
    id: 2,
    title: "Employment Handbook 2024",
    type: "pdf",
    size: "1.8 MB",
    created_at: "2024-01-19T14:30:00Z"
  },
  {
    id: 3,
    title: "IP Protection Guidelines",
    type: "docx",
    size: "856 KB",
    created_at: "2024-01-18T16:45:00Z"
  },
  {
    id: 4,
    title: "GDPR Compliance Checklist",
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
