import mongoose, { Schema, Document } from 'mongoose';

export interface IContractor extends Document {
  contractorId: string;
  name: string;
  registrationNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  statesOperating: string[];
  districtsOperating: string[];
  totalProjects: number;
  totalAllocatedValue: number;
  totalUtilizedValue: number;
  averageProjectValue: number;
  highRiskProjectCount: number;
  riskRate: number; // percentage of projects that are high/critical risk
  topCategories: { category: string; count: number }[];
  isFlaggedConcentration: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContractorSchema = new Schema<IContractor>(
  {
    contractorId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    registrationNumber: { type: String },
    contactPerson: { type: String },
    phone: { type: String },
    email: { type: String },
    statesOperating: [{ type: String }],
    districtsOperating: [{ type: String }],
    totalProjects: { type: Number, default: 0 },
    totalAllocatedValue: { type: Number, default: 0 },
    totalUtilizedValue: { type: Number, default: 0 },
    averageProjectValue: { type: Number, default: 0 },
    highRiskProjectCount: { type: Number, default: 0 },
    riskRate: { type: Number, default: 0 },
    topCategories: [
      {
        category: { type: String },
        count: { type: Number },
      },
    ],
    isFlaggedConcentration: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Contractor = mongoose.model<IContractor>('Contractor', ContractorSchema);
