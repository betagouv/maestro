import { z } from 'zod';
import { LocalPrescriptionKey } from './LocalPrescriptionKey';

export const SubstanceLaboratory = z.object({
  substance: z.enum(['Any', 'Mono', 'Multi', 'Copper']),
  laboratoryId: z.guid()
});

export const LocalPrescriptionLaboratory = z.object({
  ...LocalPrescriptionKey.omit({
    companySiret: true
  }).shape,
  ...SubstanceLaboratory.shape
});

export type SubstanceLaboratory = z.infer<typeof SubstanceLaboratory>;
export type LocalPrescriptionLaboratory = z.infer<
  typeof LocalPrescriptionLaboratory
>;
