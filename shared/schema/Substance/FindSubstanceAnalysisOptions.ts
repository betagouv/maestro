import { z } from 'zod';

export const FindSubstanceAnalysisOptions = z.object({
  matrix: z.string(),
  year: z.number(),
});

export type FindSubstanceAnalysisOptions = z.infer<
  typeof FindSubstanceAnalysisOptions
>;
