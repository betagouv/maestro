import { z } from 'zod';

export const Seves = z.object({
  id: z.number().brand('SevesId'),
  numero: z.string()
});

export type Seves = z.infer<typeof Seves>;
export type SevesId = Seves['id'];

export const SevesNotice = z.enum(['recommended', 'lmrExceeded']);

export type SevesNotice = z.infer<typeof SevesNotice>;
