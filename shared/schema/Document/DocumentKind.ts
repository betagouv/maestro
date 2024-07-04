import { z } from 'zod';

export const DocumentKind = z.enum([
  'OverviewDocument',
  'SupportDocument',
  'AnalysisDocument',
]);

export type DocumentKind = z.infer<typeof DocumentKind>;
