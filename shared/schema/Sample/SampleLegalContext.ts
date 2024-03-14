import { z } from 'zod';

export const SampleLegalContext = z.enum(['Administrative', 'Judicial'], {
  errorMap: () => ({ message: 'Veuillez renseigner le cadre juridique.' }),
});

export type SampleLegalContext = z.infer<typeof SampleLegalContext>;

export const SampleLegalContextList: SampleLegalContext[] = [
  'Administrative',
  'Judicial',
];

export const SampleLegalContextLabels: Record<SampleLegalContext, string> = {
  Administrative: 'Prélèvement administratif',
  Judicial: 'Prélèvement judiciaire',
};
