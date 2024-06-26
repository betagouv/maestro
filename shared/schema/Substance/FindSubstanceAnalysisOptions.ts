import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';

export const FindSubstanceAnalysisOptions = z.object({
  matrix: Matrix.optional().nullable(),
  year: z.coerce.number().optional().nullable(),
});

export type FindSubstanceAnalysisOptions = z.infer<
  typeof FindSubstanceAnalysisOptions
>;
