import { z } from 'zod';

export const SachaCommunicationMethod = z.enum(['EMAIL', 'SFTP']);
export type SachaCommunicationMethod = z.infer<typeof SachaCommunicationMethod>;
