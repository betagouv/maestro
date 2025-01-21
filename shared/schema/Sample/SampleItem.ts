import { z } from 'zod';
import { QuantityUnit } from '../../referential/QuantityUnit';
import { SampleItemRecipientKind } from './SampleItemRecipientKind';

export const SampleItem = z.object({
  sampleId: z.string().uuid(),
  itemNumber: z.number().int().positive(),
  quantity: z
    .number({
      required_error: 'Veuillez renseigner la quantité.'
    })
    .nonnegative('La quantité doit être positive.'),
  quantityUnit: QuantityUnit,
  compliance200263: z.boolean().nullish(),
  sealId: z.string({
    required_error: 'Veuillez renseigner le numéro de scellé.'
  }),
  supportDocumentId: z.string().uuid().nullish(),
  recipientKind: SampleItemRecipientKind,
  ownerFirstName: z.string().nullish(),
  ownerLastName: z.string().nullish(),
  ownerEmail: z
    .string()
    .email("L'adresse email du détenteur est invalide.")
    .nullish(),
  ownerAgreement: z.boolean({
    required_error: "Veuillez renseigner l'accord du détenteur."
  }),
  notesOnOwnerAgreement: z.string().nullish()
});

export const PartialSampleItem = SampleItem.partial().merge(
  SampleItem.pick({
    sampleId: true,
    itemNumber: true
  }).merge(
    z.object({
      ownerEmail: z.string().nullish(),
      ownerAgreement: z.boolean().nullish()
    })
  )
);

export type SampleItem = z.infer<typeof SampleItem>;
export type PartialSampleItem = z.infer<typeof PartialSampleItem>;

export const SampleItemSort = (a: PartialSampleItem, b: PartialSampleItem) =>
  a.itemNumber - b.itemNumber;
