import { z } from 'zod';
import type { UserPermission } from '../User/UserPermission';
import type { DistributionKind } from './DistributionKind';

export const ProgrammingPlanStatus = z.enum(
  [
    'InProgress',
    'SubmittedToAdmin',
    'SubmittedToRegion',
    'SubmittedToDepartments',
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

export const ProgrammingPlanStatusPermissions: Record<
  ProgrammingPlanStatus,
  UserPermission
> = {
  InProgress: 'readProgrammingPlansInProgress',
  SubmittedToAdmin: 'readProgrammingPlansInProgress',
  SubmittedToRegion: 'readProgrammingPlanSubmittedToRegion',
  SubmittedToDepartments: 'readProgrammingPlanSubmittedToDepartments',
  Validated: 'readProgrammingPlanValidated',
  Closed: 'readProgrammingPlanClosed'
};

export const NextProgrammingPlanStatus = {
  REGIONAL: {
    InProgress: 'SubmittedToAdmin',
    SubmittedToAdmin: 'SubmittedToRegion',
    SubmittedToRegion: 'Validated',
    SubmittedToDepartments: null,
    Validated: 'Closed',
    Closed: null
  },
  SLAUGHTERHOUSE: {
    InProgress: 'SubmittedToRegion',
    SubmittedToAdmin: 'SubmittedToRegion',
    SubmittedToRegion: 'SubmittedToDepartments',
    SubmittedToDepartments: 'Validated',
    Validated: 'Closed',
    Closed: null
  },
  TO_BE_DEFINED: {
    InProgress: 'SubmittedToRegion',
    SubmittedToAdmin: 'SubmittedToRegion',
    SubmittedToRegion: 'SubmittedToDepartments',
    SubmittedToDepartments: 'Validated',
    Validated: 'Closed',
    Closed: null
  }
} satisfies Record<
  DistributionKind,
  Record<ProgrammingPlanStatus, ProgrammingPlanStatus | null>
>;
