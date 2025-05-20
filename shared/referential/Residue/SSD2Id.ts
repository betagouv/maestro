import { z } from 'zod';

export const SSD2Id = z.string();
export type SSD2Id = z.infer<typeof SSD2Id>;
