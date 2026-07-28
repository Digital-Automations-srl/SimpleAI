import type { Model, Types } from 'mongoose';
import type { TImprovementArea, TImprovementPriority } from 'librechat-data-provider';
import type { IImprovementReport } from '~/types';
import logger from '~/config/winston';

export interface CreateImprovementReportData {
  user: string | Types.ObjectId;
  email?: string;
  description: string;
  priority: TImprovementPriority;
  area: TImprovementArea;
  appVersion?: string;
}

export function createImprovementReportMethods(mongoose: typeof import('mongoose')): {
  createImprovementReport: (data: CreateImprovementReportData) => Promise<IImprovementReport>;
  markImprovementReportEmailSent: (reportId: string | Types.ObjectId) => Promise<void>;
} {
  /**
   * Persists an improvement report. Stored before the notification email is attempted,
   * so a misconfigured mail transport can never lose the report.
   */
  async function createImprovementReport(
    data: CreateImprovementReportData,
  ): Promise<IImprovementReport> {
    const ImprovementReport = mongoose.models.ImprovementReport as Model<IImprovementReport>;
    return await ImprovementReport.create(data);
  }

  async function markImprovementReportEmailSent(reportId: string | Types.ObjectId): Promise<void> {
    try {
      const ImprovementReport = mongoose.models.ImprovementReport as Model<IImprovementReport>;
      await ImprovementReport.updateOne({ _id: reportId }, { $set: { emailSent: true } });
    } catch (error) {
      logger.error('[markImprovementReportEmailSent] Error updating report', error);
    }
  }

  return { createImprovementReport, markImprovementReportEmailSent };
}

export type ImprovementReportMethods = ReturnType<typeof createImprovementReportMethods>;
