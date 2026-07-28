import { Model } from 'mongoose';
import type { IImprovementReport } from '~/types';
import { applyTenantIsolation } from '~/models/plugins/tenantIsolation';
import improvementReportSchema from '~/schema/improvementReport';

export function createImprovementReportModel(
  mongoose: typeof import('mongoose'),
): Model<IImprovementReport> {
  applyTenantIsolation(improvementReportSchema);
  return (
    mongoose.models.ImprovementReport ||
    mongoose.model<IImprovementReport>('ImprovementReport', improvementReportSchema)
  );
}
