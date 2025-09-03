import { z } from 'zod';
import { AnalysisStatus } from './AnalysisStatus';
import { PartialResidue, Residue } from './Residue/Residue';

export const PartialAnalysis = z.object({
  id: z.guid(),
  sampleId: z.guid(),
  createdAt: z.coerce.date(),
  createdBy: z.guid().nullish(),
  status: AnalysisStatus,
  residues: z.array(PartialResidue).nullish(),
  compliance: z
    .boolean({
      message: "Veuillez renseigner la conformité de l'échantillon."
    })
    .optional(),
  notesOnCompliance: z.string().nullish()
});

export const Analysis = z.object({
  ...PartialAnalysis.shape,
  ...PartialAnalysis.pick({
    status: true,
    compliance: true
  }).required().shape,
  residues: z.array(Residue)
});

export const AnalysisToCreate = Analysis.pick({
  sampleId: true
});

export const AnalysisToUpdate = PartialAnalysis.omit({
  id: true,
  sampleId: true,
  createdAt: true,
  createdBy: true
});

export const CreatedAnalysis = z.object({
  ...AnalysisToCreate.shape,
  ...Analysis.pick({
    id: true,
    createdAt: true,
    createdBy: true,
    status: true
  }).shape
});

export type Analysis = z.infer<typeof Analysis>;
export type AnalysisToCreate = z.infer<typeof AnalysisToCreate>;
export type AnalysisToUpdate = z.infer<typeof AnalysisToUpdate>;
export type CreatedAnalysis = z.infer<typeof CreatedAnalysis>;
export type PartialAnalysis = z.infer<typeof PartialAnalysis>;
