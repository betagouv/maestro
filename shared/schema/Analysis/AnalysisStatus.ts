import { z } from 'zod';

export const AnalysisStatus = z.enum(
  ['Sent', 'NotAdmissible', 'Analysis', 'InReview', 'Completed'],
  {
    error: () => 'Statut non renseigné.'
  }
);

export type AnalysisStatus = z.infer<typeof AnalysisStatus>;

export const AnalysisStatusList: AnalysisStatus[] = AnalysisStatus.options;

export const AnalysisStatusPriority: Record<AnalysisStatus, number> = {
  Completed: 1,
  NotAdmissible: 2,
  InReview: 3,
  Analysis: 4,
  Sent: 5
};
