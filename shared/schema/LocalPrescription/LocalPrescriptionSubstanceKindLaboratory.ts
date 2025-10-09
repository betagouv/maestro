import { z } from 'zod';
import { SubstanceKind, SubstanceKindSort } from '../Substance/SubstanceKind';
import { LocalPrescriptionKey } from './LocalPrescriptionKey';

export const SubstanceKindLaboratory = z.object({
  substanceKind: SubstanceKind,
  laboratoryId: z.guid().nullish()
});

export const LocalPrescriptionSubstanceKindLaboratory = z.object({
  ...LocalPrescriptionKey.omit({
    companySiret: true
  }).shape,
  ...SubstanceKindLaboratory.shape
});

export type SubstanceKindLaboratory = z.infer<typeof SubstanceKindLaboratory>;
export type LocalPrescriptionSubstanceKindLaboratory = z.infer<
  typeof LocalPrescriptionSubstanceKindLaboratory
>;

export const SubstanceKindLaboratorySort = (
  a: SubstanceKindLaboratory,
  b: SubstanceKindLaboratory
) => SubstanceKindSort(a.substanceKind, b.substanceKind);
