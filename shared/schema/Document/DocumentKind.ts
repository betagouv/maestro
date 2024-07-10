import { z } from 'zod';

export const DocumentKind = z.enum([
  'Resource',
  'SupportDocument',
  'AnalysisReportDocument',
]);

export const DocumentKindList: DocumentKind[] = DocumentKind.options;

export type DocumentKind = z.infer<typeof DocumentKind>;
