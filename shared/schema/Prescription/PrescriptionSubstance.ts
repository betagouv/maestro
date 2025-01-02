import { z } from 'zod';
import { AnalysisKind } from '../Analysis/AnalysisKind';
import { Substance } from '../Substance/Substance';
export const PrescriptionSubstance = z.object({
  prescriptionId: z.string().uuid(),
  analysisKind: AnalysisKind,
  substance: Substance
});

export type PrescriptionSubstance = z.infer<typeof PrescriptionSubstance>;
