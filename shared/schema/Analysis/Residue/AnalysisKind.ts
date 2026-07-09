import { z } from 'zod';

export const AnalysisKind = z.enum(['SCREENING', 'CONFIRMATION'], {
  error: () => "Veuillez renseigner le type d'analyse."
});

export type AnalysisKind = z.infer<typeof AnalysisKind>;
/* TOTO en attente du front
export const AnalysisKindLabels: Record<AnalysisKind, string> = {
  SCREENING: 'Dépistage',
  CONFIRMATION: 'Confirmation'
};
*/
