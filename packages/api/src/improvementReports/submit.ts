import { logger } from '@librechat/data-schemas';
import { improvementReportSchema } from 'librechat-data-provider';
import type { TImprovementReport, TImprovementReportResponse } from 'librechat-data-provider';
import type { CreateImprovementReportData, IImprovementReport } from '@librechat/data-schemas';

export interface ImprovementReportReporter {
  id: string;
  email?: string;
  name?: string;
  username?: string;
}

export interface ImprovementReportEmail {
  email: string;
  subject: string;
  payload: Record<string, string>;
  template: string;
}

export interface SubmitImprovementReportParams {
  body: unknown;
  reporter: ImprovementReportReporter;
  recipient: string;
  appVersion?: string;
  createImprovementReport: (data: CreateImprovementReportData) => Promise<IImprovementReport>;
  markImprovementReportEmailSent: (reportId: string) => Promise<void>;
  sendEmail: (params: ImprovementReportEmail) => Promise<unknown>;
}

export type SubmitImprovementReportResult =
  | { success: true; data: TImprovementReportResponse }
  | { success: false; error: string };

export const IMPROVEMENT_REPORT_TEMPLATE = 'improvementReport.handlebars';

/** Builds the notification email addressed to the support inbox. */
export function buildImprovementReportEmail({
  report,
  reporter,
  recipient,
  appVersion,
}: {
  report: TImprovementReport;
  reporter: ImprovementReportReporter;
  recipient: string;
  appVersion?: string;
}): ImprovementReportEmail {
  const reporterLabel = reporter.name || reporter.username || reporter.email || reporter.id;
  return {
    email: recipient,
    subject: `[Simple AI] Segnalazione - ${report.area} - Priorità ${report.priority}`,
    template: IMPROVEMENT_REPORT_TEMPLATE,
    payload: {
      name: 'Supporto Simple AI',
      reporterName: reporterLabel,
      reporterEmail: reporter.email ?? '',
      description: report.description,
      priority: report.priority,
      area: report.area,
      appVersion: appVersion ?? '',
      year: `${new Date().getFullYear()}`,
    },
  };
}

/**
 * Validates, persists, then notifies. The report is written to the database before the
 * email is attempted, so a failing mail transport degrades to a stored-but-unsent report
 * instead of a lost one.
 */
export async function submitImprovementReport({
  body,
  reporter,
  recipient,
  appVersion,
  createImprovementReport,
  markImprovementReportEmailSent,
  sendEmail,
}: SubmitImprovementReportParams): Promise<SubmitImprovementReportResult> {
  const parsed = improvementReportSchema.safeParse(body);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid report' };
  }

  const report = parsed.data;
  const created = await createImprovementReport({
    user: reporter.id,
    email: reporter.email,
    description: report.description,
    priority: report.priority,
    area: report.area,
    appVersion,
  });

  const reportId = String(created._id);

  try {
    await sendEmail(buildImprovementReportEmail({ report, reporter, recipient, appVersion }));
    await markImprovementReportEmailSent(reportId);
    return { success: true, data: { reportId, emailSent: true } };
  } catch (error) {
    logger.error(
      `[submitImprovementReport] Report ${reportId} stored but email delivery failed`,
      error,
    );
    return { success: true, data: { reportId, emailSent: false } };
  }
}
