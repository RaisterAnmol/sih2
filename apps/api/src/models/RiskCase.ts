import mongoose, { Schema, Document } from 'mongoose';

export type CaseStatus = 'OPEN' | 'UNDER_REVIEW' | 'VERIFIED' | 'DISMISSED' | 'ESCALATED';
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ICaseNote {
  noteId: string;
  authorEmail: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: Date;
}

export interface ICaseEvidence {
  evidenceId: string;
  title: string;
  type: string; // 'DOCUMENT', 'FIELD_PHOTO', 'TENDER_EXTRACT', 'MEASUREMENT_BOOK'
  url?: string;
  uploadedBy: string;
  notes?: string;
  createdAt: Date;
}

export interface IRiskCase extends Document {
  caseId: string; // e.g. CASE-2024-MH-0042
  projectId: string;
  projectTitle: string;
  category: string;
  state: string;
  district: string;
  contractorName: string;
  allocatedAmount: number;
  riskScore: number;
  priority: CasePriority;
  status: CaseStatus;
  assignedToEmail?: string;
  assignedToName?: string;
  initialFlagReasons: string[];
  findingsSummary?: string;
  investigationOutcome?: string;
  notes: ICaseNote[];
  evidence: ICaseEvidence[];
  closedAt?: Date;
  closedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiskCaseSchema = new Schema<IRiskCase>(
  {
    caseId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    projectTitle: { type: String, required: true },
    category: { type: String, required: true },
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    contractorName: { type: String, index: true },
    allocatedAmount: { type: Number, required: true },
    riskScore: { type: Number, required: true, index: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'HIGH',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'VERIFIED', 'DISMISSED', 'ESCALATED'],
      default: 'OPEN',
      index: true,
    },
    assignedToEmail: { type: String, index: true },
    assignedToName: { type: String },
    initialFlagReasons: [{ type: String }],
    findingsSummary: { type: String },
    investigationOutcome: { type: String },
    notes: [
      {
        noteId: { type: String, required: true },
        authorEmail: { type: String, required: true },
        authorName: { type: String, required: true },
        authorRole: { type: String, required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    evidence: [
      {
        evidenceId: { type: String, required: true },
        title: { type: String, required: true },
        type: { type: String, default: 'DOCUMENT' },
        url: { type: String },
        uploadedBy: { type: String, required: true },
        notes: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    closedAt: { type: Date },
    closedBy: { type: String },
  },
  { timestamps: true }
);

export const RiskCase = mongoose.model<IRiskCase>('RiskCase', RiskCaseSchema);
