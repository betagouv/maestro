import { z } from 'zod';
import { coerceToArray, coerceToBooleanNullish } from '../../utils/utils';
import { Pagination } from '../commons/Pagination';
import { AnalysisDaiSentMethod } from './AnalysisDaiSentMethod';
import { AnalysisDaiState } from './AnalysisDaiState';

export const FindAnalysisDaiOptions = z.object({
  states: coerceToArray(z.array(AnalysisDaiState)).nullish(),
  sentDateFrom: z.coerce.date().nullish(),
  sentDateTo: z.coerce.date().nullish(),
  laboratoryIds: coerceToArray(z.array(z.guid())).nullish(),
  edi: coerceToBooleanNullish(),
  sentMethods: coerceToArray(z.array(AnalysisDaiSentMethod)).nullish(),
  sampleIds: coerceToArray(z.array(z.guid())).nullish(),
  ...Pagination.partial().shape
});

export type FindAnalysisDaiOptions = z.infer<typeof FindAnalysisDaiOptions>;
