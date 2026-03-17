import { z } from 'zod';

export const AnalysisStatus = z.enum(
  ['NotAdmissible', 'Analysis', 'InReview', 'Completed'],
  {
    error: () => 'Statut non renseigné.'
  }
);

export type AnalysisStatus = z.infer<typeof AnalysisStatus>;

export const AnalysisStatusList: AnalysisStatus[] = AnalysisStatus.options;
