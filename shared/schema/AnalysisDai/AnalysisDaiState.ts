import { z } from 'zod';

export const AnalysisDaiState = z.enum(['PENDING', 'QUEUED', 'SENT', 'ERROR']);

export type AnalysisDaiState = z.infer<typeof AnalysisDaiState>;
