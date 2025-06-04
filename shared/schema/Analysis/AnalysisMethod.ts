import { z } from 'zod/v4';

export const AnalysisMethod = z.enum(['Mono', 'Multi'], {
  error: () => "Veuillez renseigner la méthode d'analyse."
});

export type AnalysisMethod = z.infer<typeof AnalysisMethod>;

export const AnalysisMethodList: AnalysisMethod[] = AnalysisMethod.options;

export const AnalysisMethodLabels: Record<AnalysisMethod, string> = {
  Mono: 'mono-résidu',
  Multi: 'multi-résidus'
};
