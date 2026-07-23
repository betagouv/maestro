import { z } from 'zod';
import type { UserPermission } from '../User/UserPermission';
import type { DistributionKind } from './DistributionKind';

export const ProgrammingPlanStatus = z.enum(
  [
    'InProgress',
    'SubmittedToAdmin',
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
  InProgress: 'En cours',
  SubmittedToAdmin: "Soumis à l'admin",
  SubmittedToRegion: 'Envoyée à la région',
  SubmittedToDepartments: 'Envoyée aux départements',
  ApprovedByRegion: 'Approuvé par la région',
  Validated: 'Campagne de prélèvements en cours',
  Closed: 'Campagne de prélèvements terminée'
};

export const ProgrammingPlanStatusPermissions: Record<
  ProgrammingPlanStatus,
  UserPermission
> = {
  InProgress: 'readProgrammingPlansInProgress',
  // Only ever set on the National echelon row, which read-permission
  // filtering here doesn't apply to (see programmingPlanController.ts) —
  // reuses the InProgress permission so this Record stays exhaustive.
  SubmittedToAdmin: 'readProgrammingPlansInProgress',
  SubmittedToRegion: 'readProgrammingPlanSubmittedToRegion',
  SubmittedToDepartments: 'readProgrammingPlanSubmittedToDepartments',
  ApprovedByRegion: 'readProgrammingPlanApprovedByRegion',
  Validated: 'readProgrammingPlanValidated',
  Closed: 'readProgrammingPlanClosed'
};

export const NextProgrammingPlanStatus = {
  REGIONAL: {
    InProgress: 'SubmittedToRegion',
    SubmittedToAdmin: 'SubmittedToRegion',
    SubmittedToRegion: 'ApprovedByRegion',
    ApprovedByRegion: 'Validated',
    SubmittedToDepartments: null,
    Validated: 'Closed',
    Closed: null
  },
  SLAUGHTERHOUSE: {
    InProgress: 'SubmittedToRegion',
    SubmittedToAdmin: 'SubmittedToRegion',
    SubmittedToRegion: 'SubmittedToDepartments',
    ApprovedByRegion: null,
    SubmittedToDepartments: 'Validated',
    Validated: 'Closed',
    Closed: null
  },
  TO_BE_DEFINED: {
    InProgress: 'SubmittedToRegion',
    SubmittedToAdmin: 'SubmittedToRegion',
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
