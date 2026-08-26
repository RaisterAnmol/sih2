import mongoose, { Schema, Document } from 'mongoose';

export type AlertType =
  | 'HIGH_RISK_PROJECT'
  | 'DUPLICATE_PROJECT'
  | 'CONTRACTOR_CONCENTRATION'
  | 'COST_ANOMALY'
  | 'DELAY_ANOMALY'
  | 'GEOGRAPHIC_ANOMALY'
  | 'DATA_QUALITY'
  | 'SPENDING_SPIKE';

export type AlertPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface IAlert extends Document {
  alertId: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  projectId?: string;
  contractorName?: string;
  district?: string;
  state?: string;
  isRead: boolean;
  readAt?: Date;
  readBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: [
        'HIGH_RISK_PROJECT',
        'DUPLICATE_PROJECT',
        'CONTRACTOR_CONCENTRATION',
        'COST_ANOMALY',
        'DELAY_ANOMALY',
        'GEOGRAPHIC_ANOMALY',
        'DATA_QUALITY',
        'SPENDING_SPIKE',
      ],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    projectId: { type: String, index: true },
    contractorName: { type: String },
    district: { type: String, index: true },
    state: { type: String, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    readBy: { type: String },
  },
  { timestamps: true }
);

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
