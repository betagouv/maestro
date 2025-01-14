import { z } from 'zod';
import { AnalysisMethod } from '../Analysis/AnalysisMethod';
import { Substance } from '../Substance/Substance';
export const PrescriptionSubstance = z.object({
  prescriptionId: z.string().uuid(),
  analysisMethod: AnalysisMethod,
  substance: Substance
});

export type PrescriptionSubstance = z.infer<typeof PrescriptionSubstance>;
