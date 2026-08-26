import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfiguration extends Document {
  configKey: string;
  weights: {
    financial: number;
    contractor: number;
    duplicate: number;
    geographic: number;
    temporal: number;
    efficiency: number;
    dataQuality: number;
  };
  thresholds: {
    lowMax: number;
    mediumMax: number;
    highMax: number;
  };
  peerCostOutlierMultiplier: number;
  contractorMonopolyPercent: number;
  similarityThreshold: number;
  updatedBy: string;
  updatedAt: Date;
}

const SystemConfigurationSchema = new Schema<ISystemConfiguration>(
  {
    configKey: { type: String, required: true, unique: true, default: 'DEFAULT' },
    weights: {
      financial: { type: Number, default: 0.25 },
      contractor: { type: Number, default: 0.20 },
      duplicate: { type: Number, default: 0.15 },
      geographic: { type: Number, default: 0.10 },
      temporal: { type: Number, default: 0.10 },
      efficiency: { type: Number, default: 0.10 },
      dataQuality: { type: Number, default: 0.10 },
    },
    thresholds: {
      lowMax: { type: Number, default: 29 },
      mediumMax: { type: Number, default: 59 },
      highMax: { type: Number, default: 79 },
    },
    peerCostOutlierMultiplier: { type: Number, default: 2.2 },
    contractorMonopolyPercent: { type: Number, default: 30 },
    similarityThreshold: { type: Number, default: 0.68 },
    updatedBy: { type: String, default: 'System' },
  },
  { timestamps: true }
);

export const SystemConfiguration = mongoose.model<ISystemConfiguration>(
  'SystemConfiguration',
  SystemConfigurationSchema
);
