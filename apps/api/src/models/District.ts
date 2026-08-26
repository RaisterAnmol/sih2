import mongoose, { Schema, Document } from 'mongoose';

export interface IDistrict extends Document {
  state: string;
  district: string;
  headquarters?: string;
  latitude: number;
  longitude: number;
  totalProjects: number;
  totalAllocated: number;
  totalUtilized: number;
  averageProjectCost: number;
  highRiskProjectsCount: number;
  averageRiskScore: number;
  activeContractorsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DistrictSchema = new Schema<IDistrict>(
  {
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    headquarters: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    totalProjects: { type: Number, default: 0 },
    totalAllocated: { type: Number, default: 0 },
    totalUtilized: { type: Number, default: 0 },
    averageProjectCost: { type: Number, default: 0 },
    highRiskProjectsCount: { type: Number, default: 0 },
    averageRiskScore: { type: Number, default: 0 },
    activeContractorsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DistrictSchema.index({ state: 1, district: 1 }, { unique: true });

export const District = mongoose.model<IDistrict>('District', DistrictSchema);
