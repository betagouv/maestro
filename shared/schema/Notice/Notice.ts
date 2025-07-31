import { z } from 'zod/v4';

export const Notice = z.object({
  type: z.enum(['root', 'dashboard']),
  title: z.string().nullable(),
  description: z.string().nullable()
});

export type Notice = z.infer<typeof Notice>;
