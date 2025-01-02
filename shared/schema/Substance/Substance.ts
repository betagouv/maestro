import { z } from 'zod';

export const Substance = z.object({
  code: z.string(),
  label: z.string()
});

export type Substance = z.infer<typeof Substance>;
