import { z } from 'zod';
export const FindProgrammingPlanOptions = z.object({});

export type FindProgrammingPlanOptions = z.infer<
  typeof FindProgrammingPlanOptions
>;
