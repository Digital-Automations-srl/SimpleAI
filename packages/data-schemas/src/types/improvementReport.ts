import type { Document, Types } from 'mongoose';
import type { TImprovementArea, TImprovementPriority } from 'librechat-data-provider';

export interface IImprovementReport extends Document {
  user: Types.ObjectId;
  email?: string;
  description: string;
  priority: TImprovementPriority;
  area: TImprovementArea;
  appVersion?: string;
  emailSent: boolean;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
