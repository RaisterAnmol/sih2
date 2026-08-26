import mongoose, { Schema, Document } from 'mongoose';

export interface IImportJob extends Document {
  jobId: string;
  filename: string;
  originalName: string;
  fileSizeBytes: number;
  uploadedBy: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  status: 'PENDING' | 'VALIDATED' | 'IMPORTED' | 'FAILED';
  validationErrors: {
    rowNumber: number;
    field: string;
    value: any;
    error: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ImportJobSchema = new Schema<IImportJob>(
  {
    jobId: { type: String, required: true, unique: true, index: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSizeBytes: { type: Number, default: 0 },
    uploadedBy: { type: String, required: true },
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    errorRows: { type: Number, default: 0 },
    warningRows: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'VALIDATED', 'IMPORTED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    validationErrors: [
      {
        rowNumber: { type: Number },
        field: { type: String },
        value: { type: Schema.Types.Mixed },
        error: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const ImportJob = mongoose.model<IImportJob>('ImportJob', ImportJobSchema);
