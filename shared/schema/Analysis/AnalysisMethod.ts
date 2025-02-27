import { z } from 'zod';

export const AnalysisMethod = z.enum(['Mono', 'Multi'], {
  errorMap: () => ({
    message: "Veuillez renseigner la méthode d'analyse."
  })
});

export type AnalysisMethod = z.infer<typeof AnalysisMethod>;

export const AnalysisMethodList: AnalysisMethod[] = AnalysisMethod.options;

export const AnalysisMethodLabels: Record<AnalysisMethod, string> = {
  Mono: 'mono-résidu',
  Multi: 'multi-résidus'
};
