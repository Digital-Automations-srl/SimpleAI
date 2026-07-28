import { z } from 'zod';

export const IMPROVEMENT_PRIORITIES = ['Bassa', 'Media', 'Alta'] as const;

export const IMPROVEMENT_AREAS = [
  'Chat',
  'Agenti',
  'Condivisione',
  'Impostazioni',
  'Altro',
] as const;

export type TImprovementPriority = (typeof IMPROVEMENT_PRIORITIES)[number];
export type TImprovementArea = (typeof IMPROVEMENT_AREAS)[number];

export const IMPROVEMENT_DESCRIPTION_MAX_LENGTH = 5000;

export const improvementReportSchema = z.object({
  description: z.string().trim().min(1).max(IMPROVEMENT_DESCRIPTION_MAX_LENGTH),
  priority: z.enum(IMPROVEMENT_PRIORITIES),
  area: z.enum(IMPROVEMENT_AREAS),
});

export type TImprovementReport = z.infer<typeof improvementReportSchema>;

export type TImprovementReportResponse = {
  reportId: string;
  emailSent: boolean;
};
