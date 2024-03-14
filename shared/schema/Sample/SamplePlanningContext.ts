import { z } from 'zod';

export const SamplePlanningContext = z.enum(['Surveillance', 'Control'], {
  errorMap: () => ({ message: 'Veuillez renseigner le contexte.' }),
});

export type SamplePlanningContext = z.infer<typeof SamplePlanningContext>;

export const SamplePlanningContextList: SamplePlanningContext[] = [
  'Surveillance',
  'Control',
];

export const SamplePlanningContextLabels: Record<
  SamplePlanningContext,
  string
> = {
  Surveillance: 'Plan de surveillance',
  Control: 'Plan de contrôle',
};
