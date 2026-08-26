import mongoose, { Schema, Document } from 'mongoose';

export type ProjectStatus = 'SANCTIONED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED' | 'CANCELLED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IDetectionSignal {
  ruleId: string;
  dimension: string;
  signal: string;
  severity: string;
  explanation: string;
  supportingValue?: Record<string, any>;
  weight: number;
}

export interface ISimilarProject {
  projectId: string;
  title: string;
  similarityScore: number;
  reasons: string[];
}

export interface IProject extends Document {
  projectId: string; // e.g. MPLAD-2024-MH-PUN-001
  title: string;
  description: string;
  category: string;
  state: string;
  district: string;
  constituency: string;
  mpName: string;
  financialYear: string;
  allocatedAmount: number;
  utilizedAmount: number;
  progress: number;
  status: ProjectStatus;
  contractorId?: string;
  contractorName: string;
  approvalDate?: Date;
  startDate?: Date;
  expectedCompletionDate?: Date;
  actualCompletionDate?: Date;
  latitude?: number;
  longitude?: number;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidenceScore: number; // 0 - 100
  dimensionScores: {
    financial: number;
    contractor: number;
    duplicate: number;
    geographic: number;
    temporal: number;
    efficiency: number;
    dataQuality: number;
  };
  signals: IDetectionSignal[];
  similarProjects: ISimilarProject[];
  recommendation: string;
  dataQualityIssues: string[];
  isGroundTruthAnomaly?: boolean;
  groundTruthType?: string;
  lastAnalyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, index: 'text' },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    constituency: { type: String, default: '' },
    mpName: { type: String, default: 'Hon. Member of Parliament' },
    financialYear: { type: String, default: '2023-2024', index: true },
    allocatedAmount: { type: Number, required: true, index: true },
    utilizedAmount: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['SANCTIONED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    contractorId: { type: String, index: true },
    contractorName: { type: String, default: 'Unknown Vendor', index: true },
    approvalDate: { type: Date, index: true },
    startDate: { type: Date },
    expectedCompletionDate: { type: Date },
    actualCompletionDate: { type: Date },
    latitude: { type: Number },
    longitude: { type: Number },
    riskScore: { type: Number, default: 0, min: 0, max: 100, index: true },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
      index: true,
    },
    confidenceScore: { type: Number, default: 75.0 },
    dimensionScores: {
      financial: { type: Number, default: 0 },
      contractor: { type: Number, default: 0 },
      duplicate: { type: Number, default: 0 },
      geographic: { type: Number, default: 0 },
      temporal: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 },
      dataQuality: { type: Number, default: 0 },
    },
    signals: [
      {
        ruleId: { type: String },
        dimension: { type: String },
        signal: { type: String },
        severity: { type: String },
        explanation: { type: String },
        supportingValue: { type: Schema.Types.Mixed },
        weight: { type: Number, default: 1.0 },
      },
    ],
    similarProjects: [
      {
        projectId: { type: String },
        title: { type: String },
        similarityScore: { type: Number },
        reasons: [{ type: String }],
      },
    ],
    recommendation: { type: String, default: 'Standard audit review.' },
    dataQualityIssues: [{ type: String }],
    isGroundTruthAnomaly: { type: Boolean, default: false },
    groundTruthType: { type: String },
    lastAnalyzedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound indexes for rapid analytics & filtering
ProjectSchema.index({ state: 1, district: 1, riskLevel: 1 });
ProjectSchema.index({ riskScore: -1, allocatedAmount: -1 });
ProjectSchema.index({ contractorName: 1, district: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
