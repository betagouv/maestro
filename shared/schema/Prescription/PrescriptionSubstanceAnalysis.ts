import { z } from 'zod';
import { AnalysisKind } from '../Analysis/AnalysisKind';
import { Substance } from '../Substance/Substance';
export const PrescriptionSubstanceAnalysis = z.object({
  prescriptionId: z.string().uuid(),
  analysisKind: AnalysisKind,
  substance: Substance,
});

export type PrescriptionSubstanceAnalysis = z.infer<
  typeof PrescriptionSubstanceAnalysis
>;
