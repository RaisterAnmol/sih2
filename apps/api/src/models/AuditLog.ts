import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userEmail: string;
  userName: string;
  userRole: string;
  action: string; // e.g. 'LOGIN', 'CASE_STATUS_CHANGE', 'DATA_IMPORT', 'RISK_SCORE_UPDATE', 'REPORT_EXPORT'
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, index: true },
    details: { type: String, required: true },
    ipAddress: { type: String },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
