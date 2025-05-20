import { z } from 'zod';
import { SSD2Referential } from './SSD2Referential';

const SSD2Ids = Object.keys(SSD2Referential);

export const SSD2Id = z
  .string({
    required_error: 'Veuillez renseigner le résidu.'
  })
  .superRefine((value, ctx) => {
    if (!SSD2Ids.includes(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_enum_value,
        received: value,
        options: SSD2Ids,
        message: 'Veuillez renseigner un identifiant valide.'
      });
    }
  });
export type SSD2Id = z.infer<typeof SSD2Id>;
