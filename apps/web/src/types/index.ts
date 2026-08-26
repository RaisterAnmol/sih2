export type UserRole = 'ADMIN' | 'AUDITOR' | 'ANALYST' | 'VIEWER';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProjectStatus = 'SANCTIONED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  designation?: string;
}

export interface DetectionSignal {
  ruleId: string;
  dimension: 'FINANCIAL' | 'CONTRACTOR' | 'DUPLICATE' | 'GEOGRAPHIC' | 'TEMPORAL' | 'EFFICIENCY' | 'DATA_QUALITY';
  signal: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  supportingValue?: Record<string, any>;
  weight?: number;
}

export interface SimilarProject {
  projectId: string;
  title: string;
  similarityScore: number;
  reasons: string[];
}

export interface Project {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  state: string;
  district: string;
  constituency?: string;
  mpName?: string;
  financialYear: string;
  allocatedAmount: number;
  utilizedAmount: number;
  progress: number;
  status: ProjectStatus;
  contractorName: string;
  approvalDate?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  latitude?: number;
  longitude?: number;
  riskScore: number;
  riskLevel: RiskLevel;
  confidenceScore: number;
  dimensionScores: {
    financial: number;
    contractor: number;
    duplicate: number;
    geographic: number;
    temporal: number;
    efficiency: number;
    dataQuality: number;
  };
  signals: DetectionSignal[];
  similarProjects: SimilarProject[];
  recommendation: string;
  isGroundTruthAnomaly?: boolean;
  createdAt: string;
}

export interface Contractor {
  _id: string;
  contractorId: string;
  name: string;
  registrationNumber?: string;
  phone?: string;
  email?: string;
  statesOperating: string[];
  districtsOperating: string[];
  totalProjects: number;
  totalAllocatedValue: number;
  totalUtilizedValue: number;
  averageProjectValue: number;
  highRiskProjectCount: number;
  riskRate: number;
  isFlaggedConcentration: boolean;
}

export interface District {
  _id: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  totalProjects: number;
  totalAllocated: number;
  totalUtilized: number;
  averageProjectCost: number;
  highRiskProjectsCount: number;
  averageRiskScore: number;
}

export interface AnomalyItem {
  _id: string;
  anomalyId: string;
  projectId: string;
  projectTitle: string;
  state: string;
  district: string;
  category: string;
  contractorName: string;
  dimension: string;
  ruleId: string;
  signal: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  explanation: string;
  supportingValue?: Record<string, any>;
  hasInvestigationCase: boolean;
  riskCaseId?: string;
  createdAt: string;
}

export interface RiskCase {
  _id: string;
  caseId: string;
  projectId: string;
  projectTitle: string;
  category: string;
  state: string;
  district: string;
  contractorName: string;
  allocatedAmount: number;
  riskScore: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED' | 'ESCALATED';
  assignedToEmail?: string;
  assignedToName?: string;
  initialFlagReasons: string[];
  findingsSummary?: string;
  investigationOutcome?: string;
  notes: Array<{
    noteId: string;
    authorEmail: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AlertItem {
  _id: string;
  alertId: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  projectId?: string;
  contractorName?: string;
  district?: string;
  state?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardSummary {
  kpis: {
    totalProjects: number;
    totalAllocatedAmount: number;
    totalUtilizedAmount: number;
    avgRiskScore: number;
    criticalRiskCount: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    totalContractors: number;
    totalAnomalies: number;
    openRiskCases: number;
  };
  charts: {
    riskDistribution: Array<{ name: string; count: number; color: string }>;
    categoryBreakdown: Array<{ category: string; count: number; totalAllocated: number; avgRisk: number }>;
    districtRisk: Array<{ state: string; district: string; projectCount: number; totalAllocated: number; avgRisk: number; highRiskCount: number }>;
    spendingByYear: Array<{ year: string; allocated: number; utilized: number; count: number }>;
  };
  topHighRiskProjects: Project[];
}
