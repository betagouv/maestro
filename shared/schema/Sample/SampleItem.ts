import { z } from 'zod';

export const SampleItem = z.object({
  sampleId: z.string().uuid(),
  itemNumber: z.number(),
  quantity: z
    .number({
      required_error: 'Veuillez renseigner la quantité.',
    })
    .nonnegative('La quantité doit être positive.'),
  quantityUnit: z.string({
    required_error: "Veuillez renseigner l'unité de quantité.",
  }),
  compliance200263: z.boolean().optional().nullable(),
  pooling: z.boolean().optional().nullable(),
  poolingCount: z.number().optional().nullable(),
  sealId: z.coerce.number({
    required_error: 'Veuillez renseigner le numéro de scellé.',
    invalid_type_error: 'Le numéro de scellé doit être un nombre.',
  }),
});

export const PartialSampleItem = SampleItem.partial().merge(
  SampleItem.pick({
    id: true,
    itemNumber: true,
  })
);

export type SampleItem = z.infer<typeof SampleItem>;
export type PartialSampleItem = z.infer<typeof PartialSampleItem>;
