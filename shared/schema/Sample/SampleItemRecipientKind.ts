import { z } from 'zod';

export const SampleItemRecipientKind = z.enum(
  ['Laboratory', 'Sampler', 'Operator'],
  {
    errorMap: () => ({ message: 'Destinataire non renseigné.' })
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
  Operator: 'Opérateur'
};
