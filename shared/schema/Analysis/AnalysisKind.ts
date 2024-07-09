import { z } from 'zod';

export const AnalysisKind = z.enum(['Mono', 'Multi']);

export type AnalysisKind = z.infer<typeof AnalysisKind>;

export const AnalysisKindList: AnalysisKind[] = AnalysisKind.options;

export const AnalysisKindLabels: Record<AnalysisKind, string> = {
  Mono: 'Mono-résidu',
  Multi: 'Multi-résidus',
};
