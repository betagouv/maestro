import { z } from 'zod/v4';

export const SampleItemRecipientKind = z.enum(
  ['Laboratory', 'Sampler', 'Operator'],
  {
    error: () => 'Destinataire non renseigné.'
  }
);

export const SampleItemRecipientKindList: SampleItemRecipientKind[] =
  SampleItemRecipientKind.options;

export type SampleItemRecipientKind = z.infer<typeof SampleItemRecipientKind>;

export const SampleItemRecipientKindLabels: Record<
  SampleItemRecipientKind,
  string
> = {
  Laboratory: 'Laboratoire',
  Sampler: 'Préleveur',
  Operator: 'Détenteur'
};
