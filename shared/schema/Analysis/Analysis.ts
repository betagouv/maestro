import { z } from 'zod';
import { AnalysisKind } from './AnalysisKind';
import { Residue } from './Residue';

export const Analysis = z.object({
  id: z.string().uuid(),
  sampleId: z.string().uuid(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid(),
  documentId: z.string().uuid(),
  kind: AnalysisKind,
  residues: z.array(Residue).min(1, {
    message: 'Veuillez renseigner au moins un résidu.',
  }),
});

export const AnalysisToCreate = Analysis.pick({
  sampleId: true,
  documentId: true,
});

export const CreatedAnalysis = AnalysisToCreate.merge(
  Analysis.pick({
    id: true,
    createdAt: true,
    createdBy: true,
  })
);

export const PartialAnalysis = Analysis.partial()
  .merge(CreatedAnalysis)
  .merge(
    z.object({
      residues: z.array(Residue).optional().nullable(),
    })
  );

export type Analysis = z.infer<typeof Analysis>;
export type AnalysisToCreate = z.infer<typeof AnalysisToCreate>;
export type CreatedAnalysis = z.infer<typeof CreatedAnalysis>;
export type PartialAnalysis = z.infer<typeof PartialAnalysis>;
