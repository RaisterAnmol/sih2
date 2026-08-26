import mongoose, { Schema, Document } from 'mongoose';

export type AnomalyDimension =
  | 'FINANCIAL'
  | 'CONTRACTOR'
  | 'DUPLICATE'
  | 'GEOGRAPHIC'
  | 'TEMPORAL'
  | 'EFFICIENCY'
  | 'DATA_QUALITY';

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IAnomaly extends Document {
  anomalyId: string;
  projectId: string;
  projectTitle: string;
  state: string;
  district: string;
  category: string;
  contractorName: string;
  dimension: AnomalyDimension;
  ruleId: string;
  signal: string;
  severity: AnomalySeverity;
  score: number;
  explanation: string;
  supportingValue?: Record<string, any>;
  hasInvestigationCase: boolean;
  riskCaseId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnomalySchema = new Schema<IAnomaly>(
  {
    anomalyId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    projectTitle: { type: String, required: true },
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    contractorName: { type: String, index: true },
    dimension: {
      type: String,
      enum: ['FINANCIAL', 'CONTRACTOR', 'DUPLICATE', 'GEOGRAPHIC', 'TEMPORAL', 'EFFICIENCY', 'DATA_QUALITY'],
      required: true,
      index: true,
    },
    ruleId: { type: String, required: true },
    signal: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      index: true,
    },
    score: { type: Number, default: 0 },
    explanation: { type: String, required: true },
    supportingValue: { type: Schema.Types.Mixed },
    hasInvestigationCase: { type: Boolean, default: false, index: true },
    riskCaseId: { type: String },
  },
  { timestamps: true }
);

export const Anomaly = mongoose.model<IAnomaly>('Anomaly', AnomalySchema);
