import { z } from 'zod';

export const AnalysisStatus = z.enum(
  ['Report', 'Residues', 'Compliance', 'Completed'],
  {
    error: () => 'Statut non renseigné.'
  }
);

export type AnalysisStatus = z.infer<typeof AnalysisStatus>;

export const AnalysisStatusList: AnalysisStatus[] = AnalysisStatus.options;
