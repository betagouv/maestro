import { z } from 'zod';
import { SSD2IdLabel, SSD2Referential } from './SSD2Referential';

export const SSD2Ids = Object.keys(SSD2Referential);

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

export const SSD2IdSort = (a: SSD2Id, b: SSD2Id) =>
  SSD2IdLabel[a].localeCompare(SSD2IdLabel[b]);
