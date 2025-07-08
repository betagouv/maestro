import { z } from 'zod/v4';

export const RootNotice = z.object({
  title: z.string(),
  description: z.string()
});

export type RootNotice = z.infer<typeof RootNotice>;
