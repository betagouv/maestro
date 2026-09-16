import { z } from 'zod';

export const DaiSentMethod = z.enum(['EMAIL', 'SFTP']);
export type DaiSentMethod = z.infer<typeof DaiSentMethod>;
