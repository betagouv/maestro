import { z } from 'zod';

export const ProgrammingPlanStatus = z.enum(['InProgress', 'Validated'], {
  errorMap: () => ({ message: 'Statut non renseigné.' }),
});

export type ProgrammingPlanStatus = z.infer<typeof ProgrammingPlanStatus>;

export const ProgrammingPlanStatusList: ProgrammingPlanStatus[] =
  ProgrammingPlanStatus.options;

export const ProgrammingPlanStatusLabels: Record<
  ProgrammingPlanStatus,
  string
> = {
  InProgress: 'Programmation 2025',
  Validated: 'Suivi 2024',
};
