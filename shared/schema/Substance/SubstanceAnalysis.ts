import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { Substance } from './Substance';
import { SubstanceAnalysisKind } from './SubstanceAnalysisKind';

export const SubstanceAnalysis = z.object({
  matrix: Matrix,
  substance: Substance,
  kind: SubstanceAnalysisKind,
  year: z.number(),
});

export type SubstanceAnalysis = z.infer<typeof SubstanceAnalysis>;
