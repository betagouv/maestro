import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { AnalysisKind } from '../Analysis/AnalysisKind';
import { Substance } from './Substance';

export const SubstanceAnalysis = z.object({
  matrix: Matrix,
  substance: Substance,
  kind: AnalysisKind,
  year: z.number(),
});

export type SubstanceAnalysis = z.infer<typeof SubstanceAnalysis>;
