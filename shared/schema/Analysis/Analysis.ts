import { z } from 'zod';
import { AnalysisKind } from './AnalysisKind';
import { AnalysisStatus } from './AnalysisStatus';
import { PartialResidue, Residue } from './Residue/Residue';

export const Analysis = z.object({
  id: z.string().uuid(),
  sampleId: z.string().uuid(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid(),
  status: AnalysisStatus,
  reportDocumentId: z.string().uuid(),
  kind: AnalysisKind,
  residues: z.array(Residue),
  compliance: z.boolean({
    message: "Veuillez renseigner la conformité de l'échantillon.",
  }),
  notesOnCompliance: z.string().nullish(),
});

export const AnalysisToCreate = Analysis.pick({
  sampleId: true,
  reportDocumentId: true,
});

export const CreatedAnalysis = AnalysisToCreate.merge(
  Analysis.pick({
    id: true,
    createdAt: true,
    createdBy: true,
    status: true,
  })
);

export const PartialAnalysis = Analysis.partial()
  .merge(CreatedAnalysis)
  .merge(
    z.object({
      residues: z.array(PartialResidue).nullish(),
    })
  );

export type Analysis = z.infer<typeof Analysis>;
export type AnalysisToCreate = z.infer<typeof AnalysisToCreate>;
export type CreatedAnalysis = z.infer<typeof CreatedAnalysis>;
export type PartialAnalysis = z.infer<typeof PartialAnalysis>;
