import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';

export const FindSubstanceAnalysisOptions = z.object({
  matrix: Matrix.nullish(),
  year: z.coerce.number().nullish(),
});

export type FindSubstanceAnalysisOptions = z.infer<
  typeof FindSubstanceAnalysisOptions
>;
