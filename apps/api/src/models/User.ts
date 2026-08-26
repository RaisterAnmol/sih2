import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'ADMIN' | 'AUDITOR' | 'ANALYST' | 'VIEWER';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  department: string;
  designation: string;
  stateAccess?: string[];
  districtAccess?: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'AUDITOR', 'ANALYST', 'VIEWER'],
      default: 'VIEWER',
      index: true,
    },
    department: { type: String, default: 'MoSPI / State Planning' },
    designation: { type: String, default: 'Statistical Officer' },
    stateAccess: [{ type: String }],
    districtAccess: [{ type: String }],
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
