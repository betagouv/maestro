import { z } from 'zod';
import { Analyte } from './Analyte';
import { ResidueKind } from './ResidueKind';

export const Residue = z.object({
  analysisId: z.string().uuid(),
  residueNumber: z.number().int().positive(),
  kind: ResidueKind,
  result: z.number().optional().nullable(),
  lmr: z.number().optional().nullable(),
  resultHigherThanArfd: z.string().optional().nullable(),
  notesOnResult: z.string().optional().nullable(),
  substanceApproved: z.string().optional().nullable(),
  substanceAuthorised: z.string().optional().nullable(),
  pollutionRisk: z.string().optional().nullable(),
  notesOnPollutionRisk: z.string().optional().nullable(),
  compliance: z.boolean().optional().nullable(),
  analytes: z.array(Analyte).min(1, {
    message: 'Veuillez renseigner au moins un analyte.',
  }),
});

export type Residue = z.infer<typeof Residue>;
