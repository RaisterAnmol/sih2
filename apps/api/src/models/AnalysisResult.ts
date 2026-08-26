import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysisResult extends Document {
  batchId: string;
  triggeredBy: string;
  totalProjectsProcessed: number;
  anomaliesDetected: number;
  highRiskCount: number;
  criticalRiskCount: number;
  modelMetrics?: {
    precision?: number;
    recall?: number;
    f1Score?: number;
    falsePositiveRate?: number;
    totalSamples?: number;
  };
  durationMs: number;
  status: 'COMPLETED' | 'FAILED' | 'RUNNING';
  createdAt: Date;
}

const AnalysisResultSchema = new Schema<IAnalysisResult>(
  {
    batchId: { type: String, required: true, unique: true, index: true },
    triggeredBy: { type: String, default: 'System' },
    totalProjectsProcessed: { type: Number, default: 0 },
    anomaliesDetected: { type: Number, default: 0 },
    highRiskCount: { type: Number, default: 0 },
    criticalRiskCount: { type: Number, default: 0 },
    modelMetrics: { type: Schema.Types.Mixed },
    durationMs: { type: Number, default: 0 },
    status: { type: String, enum: ['COMPLETED', 'FAILED', 'RUNNING'], default: 'COMPLETED' },
  },
  { timestamps: true }
);

export const AnalysisResult = mongoose.model<IAnalysisResult>('AnalysisResult', AnalysisResultSchema);
