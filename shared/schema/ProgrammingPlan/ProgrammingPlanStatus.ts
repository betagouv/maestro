import { z } from 'zod';
import { UserPermission } from '../User/UserPermission';
import { DistributionKind } from './DistributionKind';

export const ProgrammingPlanStatus = z.enum(
  [
    'InProgress',
    'SubmittedToRegion',
    'SubmittedToDepartments',
    'ApprovedByRegion',
    'Validated',
    'Closed'
  ],
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
  SubmittedToRegion: 'Soumis à la région',
  SubmittedToDepartments: 'Soumis aux départements',
  ApprovedByRegion: 'Approuvé par la région',
  Validated: 'Campagne en cours',
  Closed: 'Campagne terminée'
};

export const ProgrammingPlanStatusPermissions: Record<
  ProgrammingPlanStatus,
  UserPermission
> = {
  InProgress: 'readProgrammingPlansInProgress',
  SubmittedToRegion: 'readProgrammingPlanSubmitted',
  SubmittedToDepartments: 'readProgrammingPlanSubmitted',
  ApprovedByRegion: 'readProgrammingPlanApproved',
  Validated: 'readProgrammingPlanValidated',
  Closed: 'readProgrammingPlanClosed'
};

export const NextProgrammingPlanStatus = {
  REGIONAL: {
    InProgress: 'SubmittedToRegion',
    SubmittedToRegion: 'ApprovedByRegion',
    ApprovedByRegion: 'Validated',
    SubmittedToDepartments: null,
    Validated: 'Closed',
    Closed: null
  },
  SLAUGHTERHOUSE: {
    InProgress: 'SubmittedToRegion',
    SubmittedToRegion: 'SubmittedToDepartments',
    ApprovedByRegion: null,
    SubmittedToDepartments: 'Validated',
    Validated: 'Closed',
    Closed: null
  }
} satisfies Record<
  DistributionKind,
  Record<ProgrammingPlanStatus, ProgrammingPlanStatus | null>
>;
