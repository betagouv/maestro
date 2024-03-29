import { z } from 'zod';

export const SampleLegalContext = z.enum(['A', 'B'], {
  errorMap: () => ({ message: 'Veuillez renseigner le cadre juridique.' }),
});

export type SampleLegalContext = z.infer<typeof SampleLegalContext>;

export const SampleLegalContextList: SampleLegalContext[] = ['A', 'B'];

export const SampleLegalContextLabels: Record<SampleLegalContext, string> = {
  A: 'Police administrative',
  B: 'Police judiciaire',
};
