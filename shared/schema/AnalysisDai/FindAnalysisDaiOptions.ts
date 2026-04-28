import { z } from 'zod';
import { Pagination } from '../commons/Pagination';
import { AnalysisDaiSentMethod } from './AnalysisDaiSentMethod';
import { AnalysisDaiState } from './AnalysisDaiState';

export const FindAnalysisDaiOptions = z.object({
  states: z.array(AnalysisDaiState).nullish(),
  sentDateFrom: z.date().nullish(),
  sentDateTo: z.date().nullish(),
  laboratoryIds: z.array(z.guid()).nullish(),
  edi: z.boolean().nullish(),
  sentMethods: z.array(AnalysisDaiSentMethod).nullish(),
  sampleIds: z.array(z.guid()).nullish(),
  ...Pagination.partial().shape
});

export type FindAnalysisDaiOptions = z.infer<typeof FindAnalysisDaiOptions>;
