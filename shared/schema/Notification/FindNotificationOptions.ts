import { z } from 'zod/v4';

export const FindNotificationOptions = z.object({
  recipientId: z.guid(),
  read: z
    .preprocess((val) => val === true || val === 'true', z.boolean())
    .nullish()
});

export type FindNotificationOptions = z.infer<typeof FindNotificationOptions>;
