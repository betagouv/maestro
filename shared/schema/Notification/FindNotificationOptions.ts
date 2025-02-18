import { z } from 'zod';

export const FindNotificationOptions = z.object({
  recipientId: z.string().uuid(),
  read: z
    .preprocess((val) => val === true || val === 'true', z.boolean())
    .nullish()
});

export type FindNotificationOptions = z.infer<typeof FindNotificationOptions>;
