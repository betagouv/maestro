import { z } from 'zod';
import { SSD2Id } from '../../referential/Residue/SSD2Id';

export const Substance = z.object({
  code: SSD2Id,
  label: z.string()
});

export type Substance = z.infer<typeof Substance>;
