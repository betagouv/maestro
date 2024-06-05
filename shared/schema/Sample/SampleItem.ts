import { z } from 'zod';
import { QuantityUnit } from '../../referential/QuantityUnit';

export const SampleItem = z.object({
  sampleId: z.string().uuid(),
  itemNumber: z.number(),
  quantity: z
    .number({
      required_error: 'Veuillez renseigner la quantité.',
    })
    .nonnegative('La quantité doit être positive.'),
  quantityUnit: QuantityUnit,
  compliance200263: z.boolean().optional().nullable(),
  sealId: z.string({
    required_error: 'Veuillez renseigner le numéro de scellé.',
  }),
  documentId: z.string().uuid().optional().nullable(),
});

export const PartialSampleItem = SampleItem.partial().merge(
  SampleItem.pick({
    id: true,
    itemNumber: true,
  })
);

export type SampleItem = z.infer<typeof SampleItem>;
export type PartialSampleItem = z.infer<typeof PartialSampleItem>;
