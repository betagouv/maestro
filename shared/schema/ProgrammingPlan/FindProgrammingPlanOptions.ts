import { z } from 'zod';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';
export const FindProgrammingPlanOptions = z.object({
  year: z.number().int().nullish(),
  status: coerceToArray(z.array(ProgrammingPlanStatus)).nullish(),
  isDrom: z.boolean().nullish()
});

export type FindProgrammingPlanOptions = z.infer<
  typeof FindProgrammingPlanOptions
>;
