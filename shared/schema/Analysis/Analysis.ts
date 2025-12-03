import { z } from 'zod';
import { AnalysisStatus } from './AnalysisStatus';
import { PartialResidue, Residue } from './Residue/Residue';

export const PartialAnalysis = z.object({
  id: z.guid(),
  sampleId: z.guid(),
  createdAt: z.coerce.date(),
  emailReceivedAt: z.coerce.date().nullish(),
  createdBy: z.guid().nullish(),
  status: AnalysisStatus,
  residues: z.array(PartialResidue).nullish(),
  compliance: z
    .boolean({
      message: "Veuillez renseigner la conformité de l'échantillon."
    })
    .nullable(),
  notesOnCompliance: z.string().nullable()
});

export const Analysis = z.object({
  ...PartialAnalysis.shape,
  compliance: z.boolean({
    message: "Veuillez renseigner la conformité de l'échantillon."
  }),
  notesOnCompliance: z.string().nullable(),
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

export type Analysis = z.infer<typeof Analysis>;
export type AnalysisToCreate = z.infer<typeof AnalysisToCreate>;
export type AnalysisToUpdate = z.infer<typeof AnalysisToUpdate>;
export type PartialAnalysis = z.infer<typeof PartialAnalysis>;
