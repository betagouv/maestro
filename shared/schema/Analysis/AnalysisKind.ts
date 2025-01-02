import { z } from 'zod';

export const AnalysisKind = z.enum(['Mono', 'Multi'], {
  errorMap: () => ({
    message: "Veuillez renseigner la méthode d'analyse."
  })
});

export type AnalysisKind = z.infer<typeof AnalysisKind>;

export const AnalysisKindList: AnalysisKind[] = AnalysisKind.options;

export const AnalysisKindLabels: Record<AnalysisKind, string> = {
  Mono: 'mono-résidu',
  Multi: 'multi-résidus'
};
