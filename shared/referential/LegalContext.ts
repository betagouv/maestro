import { z } from 'zod/v4';

export const LegalContext = z.enum(['A', 'B'], {
  error: () => 'Veuillez renseigner le cadre juridique.'
});

export type LegalContext = z.infer<typeof LegalContext>;

export const LegalContextList: LegalContext[] = LegalContext.options;

export const LegalContextLabels: Record<LegalContext, string> = {
  A: 'Police administrative',
  B: 'Police judiciaire'
};
