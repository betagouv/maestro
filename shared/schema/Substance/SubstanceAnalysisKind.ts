import { z } from 'zod';

export const SubstanceAnalysisKind = z.enum(['Mono', 'Multi']);

export type SubstanceAnalysisKind = z.infer<typeof SubstanceAnalysisKind>;

export const SubstanceAnalysisKindList: SubstanceAnalysisKind[] =
  SubstanceAnalysisKind.options;
