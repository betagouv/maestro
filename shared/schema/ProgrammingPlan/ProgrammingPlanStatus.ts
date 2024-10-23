import { z } from 'zod';

export const ProgrammingPlanStatus = z.enum(
  ['InProgress', 'Submitted', 'Validated'],
  {
    errorMap: () => ({ message: 'Statut non renseigné.' }),
  }
);

export type ProgrammingPlanStatus = z.infer<typeof ProgrammingPlanStatus>;

export const ProgrammingPlanStatusList: ProgrammingPlanStatus[] =
  ProgrammingPlanStatus.options;

export const ProgrammingPlanStatusLabels: Record<
  ProgrammingPlanStatus,
  string
> = {
  InProgress: 'Programmation',
  Submitted: 'Programmation',
  Validated: 'Suivi',
};
