import { z } from 'zod';
import { AnalysisStatus } from './AnalysisStatus';
import { PartialResidue, Residue } from './Residue/Residue';

export const PartialAnalysis = z.object({
  id: z.string().uuid(),
  sampleId: z.string().uuid(),
  createdAt: z.coerce.date(),
  createdBy: z.string().uuid(),
  status: AnalysisStatus,
  reportDocumentId: z.string().uuid(),
  residues: z.array(PartialResidue).nullish(),
  compliance: z
    .boolean({
      message: "Veuillez renseigner la conformité de l'échantillon."
    })
    .optional(),
  notesOnCompliance: z.string().nullish()
});

export const Analysis = PartialAnalysis.merge(
  PartialAnalysis.pick({
    status: true,
    compliance: true
  }).required()
).extend({
  residues: z.array(Residue)
});

export const AnalysisToCreate = Analysis.pick({
  sampleId: true,
  reportDocumentId: true
});

export const CreatedAnalysis = AnalysisToCreate.merge(
  Analysis.pick({
    id: true,
    createdAt: true,
    createdBy: true,
    status: true
  })
);

export type Analysis = z.infer<typeof Analysis>;
export type AnalysisToCreate = z.infer<typeof AnalysisToCreate>;
export type CreatedAnalysis = z.infer<typeof CreatedAnalysis>;
export type PartialAnalysis = z.infer<typeof PartialAnalysis>;
