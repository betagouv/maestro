import { z } from 'zod';

export const ProgrammingPlanKind = z.enum(['Surveillance', 'Control'], {
  errorMap: () => ({ message: 'Veuillez renseigner le contexte.' }),
});

export type ProgrammingPlanKind = z.infer<typeof ProgrammingPlanKind>;

export const ProgrammingPlanKindList: ProgrammingPlanKind[] = [
  'Surveillance',
  'Control',
];

export const ProgrammingPlanKindLabels: Record<ProgrammingPlanKind, string> = {
  Surveillance: 'Plan de surveillance',
  Control: 'Plan de contrôle',
};
