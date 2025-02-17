import { z } from 'zod';

export const FindNotificationOptions = z.object({
  userId: z.string().uuid(),
  read: z.boolean().optional()
});

export type FindNotificationOptions = z.infer<typeof FindNotificationOptions>;
