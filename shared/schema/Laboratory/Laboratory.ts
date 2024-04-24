import { z } from 'zod';
export const Laboratory = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type Laboratory = z.infer<typeof Laboratory>;
