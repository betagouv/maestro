import { z } from 'zod';
import { ProgrammingSubPlanId } from './ProgrammingSubPlan';

export const FindProgrammingSubPlanOptions = z.object({
  ids: z.array(ProgrammingSubPlanId).nullish(),
  programmingPlanId: z.string().guid().nullish()
});

export type FindProgrammingSubPlanOptions = z.infer<
  typeof FindProgrammingSubPlanOptions
>;
