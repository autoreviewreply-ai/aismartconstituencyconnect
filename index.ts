export type Category = 
  | 'Roads & Traffic' 
  | 'Sanitation & Waste' 
  | 'Water Supply' 
  | 'Streetlights & Electricity' 
  | 'Public Safety' 
  | 'Public Health' 
  | 'Other';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus = 'Pending' | 'Under Review' | 'In Progress' | 'Resolved';

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  timestamp: string;
  isInternal: boolean;
}

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  authorName: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: Category;
  latitude: number;
  longitude: number;
  imageMimeType?: string;
  imageData?: string; // base64 encoded string or mock image URL
  contactEmail: string;
  contactName: string;
  upvotes: number;
  votedUserEmails: string[];
  status: ComplaintStatus;
  ward: string;
  createdAt: string;
  
  // AI-enriched attributes
  aiPriority: PriorityLevel;
  aiPriorityReasoning: string;
  aiCategorySuggested: Category;
  aiSafetyRecommendations: string[];
  aiOfficerRecommendations: string[];
  aiAssignedDepartment: string;
  duplicateOfId?: string | null;
  
  comments: Comment[];
  logs: ActivityLog[];
}

export interface AnalyticsSummary {
  totalComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  pendingComplaints: number;
  avgResolutionTimeDays: number;
  byCategory: { category: Category; count: number }[];
  byPriority: { priority: PriorityLevel; count: number }[];
  byStatus: { status: ComplaintStatus; count: number }[];
  byWard: { ward: string; total: number; resolved: number }[];
}

export interface PlanningReport {
  id: string;
  generatedAt: string;
  executiveSummary: string;
  budgetAllocations: { department: string; allocationPercentage: number; justification: string }[];
  criticalHotspots: { location: string; issueCount: number; primaryConcern: string }[];
  strategicRecommendations: string[];
  rawAnalysisText: string;
}
