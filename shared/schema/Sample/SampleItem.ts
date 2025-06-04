import { isNil } from 'lodash-es';
import { z } from 'zod/v4';
import { QuantityUnit } from '../../referential/QuantityUnit';
import { SampleItemRecipientKind } from './SampleItemRecipientKind';

export const SampleItem = z.object({
  sampleId: z.guid(),
  itemNumber: z.number().int().positive(),
  quantity: z
    .number({
      error: (issue) =>
        isNil(issue.input) ? 'Veuillez renseigner la quantité.' : issue.message
    })
    .nonnegative('La quantité doit être positive.'),
  quantityUnit: QuantityUnit,
  compliance200263: z.boolean().nullish(),
  sealId: z.string({
    error: (issue) =>
      isNil(issue.input)
        ? 'Veuillez renseigner le numéro de scellé.'
        : issue.message
  }),
  supportDocumentId: z.guid().nullish(),
  recipientKind: SampleItemRecipientKind
});

export const PartialSampleItem = SampleItem.partial().merge(
  SampleItem.pick({
    sampleId: true,
    itemNumber: true
  })
);

export type SampleItem = z.infer<typeof SampleItem>;
export type PartialSampleItem = z.infer<typeof PartialSampleItem>;

export const SampleItemSort = (a: PartialSampleItem, b: PartialSampleItem) =>
  a.itemNumber - b.itemNumber;
