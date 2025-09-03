import { z } from 'zod';
import { UserPermission } from '../User/UserPermission';

export const ProgrammingPlanStatus = z.enum(
  ['InProgress', 'Submitted', 'Approved', 'Validated', 'Closed'],
  {
    error: () => 'Statut non renseigné.'
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
  Approved: 'Approuvé par les régions',
  Validated: 'Campagne en cours',
  Closed: 'Campagne terminée'
};

export const ProgrammingPlanStatusPermissions: Record<
  ProgrammingPlanStatus,
  UserPermission
> = {
  InProgress: 'readProgrammingPlansInProgress',
  Submitted: 'readProgrammingPlanSubmitted',
  Approved: 'readProgrammingPlanApproved',
  Validated: 'readProgrammingPlanValidated',
  Closed: 'readProgrammingPlanClosed'
};

export const NextProgrammingPlanStatus: Record<
  ProgrammingPlanStatus,
  ProgrammingPlanStatus | null
> = {
  InProgress: 'Submitted',
  Submitted: 'Approved',
  Approved: 'Validated',
  Validated: 'Closed',
  Closed: null
};
