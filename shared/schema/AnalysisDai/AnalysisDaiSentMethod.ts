import { z } from 'zod';

export const AnalysisDaiSentMethod = z.enum(['EMAIL', 'SFTP']);

export type AnalysisDaiSentMethod = z.infer<typeof AnalysisDaiSentMethod>;
