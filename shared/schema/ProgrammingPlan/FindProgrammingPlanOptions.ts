import { z } from 'zod';
export const FindProgrammingPlanOptions = z.object({
  year: z.number().int().nullish(),
});

export type FindProgrammingPlanOptions = z.infer<
  typeof FindProgrammingPlanOptions
>;
