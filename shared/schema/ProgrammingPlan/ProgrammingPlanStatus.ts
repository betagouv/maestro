import { z } from 'zod';

export const ProgrammingPlanStatus = z.enum(['ToValidate', 'Validated'], {
  errorMap: () => ({ message: 'Statut non renseigné.' }),
});

export type ProgrammingPlanStatus = z.infer<typeof ProgrammingPlanStatus>;

export const ProgrammingPlanStatusList: ProgrammingPlanStatus[] = [
  'ToValidate',
  'Validated',
];

export const ProgrammingPlanStatusLabels: Record<
  ProgrammingPlanStatus,
  string
> = {
  ToValidate: 'A valider',
  Validated: 'Validé',
};
