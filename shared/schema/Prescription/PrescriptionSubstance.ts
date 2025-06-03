import { z } from 'zod/v4';
import { SSD2Id } from '../../referential/Residue/SSD2Id';
import { AnalysisMethod } from '../Analysis/AnalysisMethod';
export const PrescriptionSubstance = z.object({
  prescriptionId: z.guid(),
  analysisMethod: AnalysisMethod,
  substance: SSD2Id
});

export type PrescriptionSubstance = z.infer<typeof PrescriptionSubstance>;
