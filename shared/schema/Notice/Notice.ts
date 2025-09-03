import { z } from 'zod';

export const Notice = z.object({
  type: z.enum(['root', 'dashboard']),
  title: z.string().nullable(),
  description: z.string().nullable()
});

export type Notice = z.infer<typeof Notice>;
