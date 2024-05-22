import { z } from 'zod';

export const LegalContext = z.enum(['A', 'B'], {
  errorMap: () => ({ message: 'Veuillez renseigner le cadre juridique.' }),
});

export type LegalContext = z.infer<typeof LegalContext>;

export const LegalContextList: LegalContext[] = LegalContext.options;

export const LegalContextLabels: Record<LegalContext, string> = {
  A: 'Police administrative',
  B: 'Police judiciaire',
};
