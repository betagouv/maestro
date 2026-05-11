import { z } from 'zod';
import { Pagination } from '../commons/Pagination';
import { AnalysisRaiSource, AnalysisRaiState } from './AnalysisRai';

export const FindAnalysisRaiOptions = z.object({
  states: z.array(AnalysisRaiState).nullish(),
  sources: z.array(AnalysisRaiSource).nullish(),
  edi: z.boolean().nullish(),
  laboratoryIds: z.array(z.guid()).nullish(),
  receivedAtFrom: z.date().nullish(),
  receivedAtTo: z.date().nullish(),
  sampleIds: z.array(z.guid()).nullish(),
  ...Pagination.partial().shape
});

export type FindAnalysisRaiOptions = z.infer<typeof FindAnalysisRaiOptions>;
