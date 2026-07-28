import { Schema } from 'mongoose';
import {
  IMPROVEMENT_AREAS,
  IMPROVEMENT_PRIORITIES,
  IMPROVEMENT_DESCRIPTION_MAX_LENGTH,
} from 'librechat-data-provider';
import type { IImprovementReport } from '~/types';

const improvementReportSchema: Schema<IImprovementReport> = new Schema<IImprovementReport>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
    },
    description: {
      type: String,
      required: true,
      maxlength: IMPROVEMENT_DESCRIPTION_MAX_LENGTH,
    },
    priority: {
      type: String,
      enum: IMPROVEMENT_PRIORITIES,
      default: 'Media',
    },
    area: {
      type: String,
      enum: IMPROVEMENT_AREAS,
      default: 'Chat',
    },
    appVersion: {
      type: String,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    tenantId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true },
);

improvementReportSchema.index({ createdAt: -1 });

export default improvementReportSchema;
