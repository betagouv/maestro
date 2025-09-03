import { isNil } from 'lodash-es';
import { z } from 'zod';
import { SSD2IdLabel, SSD2Referential } from './SSD2Referential';

export const SSD2Ids = Object.keys(SSD2Referential);

export const SSD2Id = z
  .string({
    error: (issue) =>
      isNil(issue.input)
        ? 'Veuillez renseigner le résidu.'
        : "N'est pas une chaîne de caractères"
  })
  .check((ctx) => {
    if (!SSD2Ids.includes(ctx.value)) {
      ctx.issues.push({
        code: 'invalid_value',
        input: ctx.value,
        values: SSD2Ids,
        message: 'Veuillez renseigner un identifiant valide.'
      });
    }
  });

export type SSD2Id = z.infer<typeof SSD2Id>;

export const SSD2IdSort = (a: SSD2Id, b: SSD2Id) =>
  SSD2IdLabel[a].localeCompare(SSD2IdLabel[b]);
