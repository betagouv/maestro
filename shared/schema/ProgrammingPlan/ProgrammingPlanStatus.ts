import { z } from 'zod';
import { UserPermission } from '../User/UserPermission';

export const ProgrammingPlanStatus = z.enum(
  ['InProgress', 'Submitted', 'Validated', 'Closed'],
  {
    errorMap: () => ({ message: 'Statut non renseigné.' })
  }
);

export type ProgrammingPlanStatus = z.infer<typeof ProgrammingPlanStatus>;

export const ProgrammingPlanStatusList: ProgrammingPlanStatus[] =
  ProgrammingPlanStatus.options;

export const ProgrammingPlanStatusLabels: Record<
  ProgrammingPlanStatus,
  string
> = {
  InProgress: 'Programmation en cours',
  Submitted: 'Soumis aux régions',
  Validated: 'Campagne en cours',
  Closed: 'Campagne terminée'
};

export const ProgrammingPlanStatusPermissions: Record<
  ProgrammingPlanStatus,
  UserPermission
> = {
  InProgress: 'readProgrammingPlansInProgress',
  Submitted: 'readProgrammingPlanSubmitted',
  Validated: 'readProgrammingPlanValidated',
  Closed: 'readProgrammingPlanClosed'
};

export const NextProgrammingPlanStatus: Record<
  ProgrammingPlanStatus,
  ProgrammingPlanStatus | null
> = {
  InProgress: 'Submitted',
  Submitted: 'Validated',
  Validated: null,
  Closed: null
};
