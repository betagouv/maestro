import { z } from 'zod';

export const SampleContext = z.enum(['Surveillance', 'Control'], {
  errorMap: () => ({ message: 'Veuillez renseigner le contexte.' }),
});

export type SampleContext = z.infer<typeof SampleContext>;

export const SampleContextList: SampleContext[] = ['Surveillance', 'Control'];

export const SampleContextLabels: Record<SampleContext, string> = {
  Surveillance: 'Plan de surveillance',
  Control: 'Plan de contrôle',
};
