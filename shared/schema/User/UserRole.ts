import { z } from 'zod';
import { UserPermission } from './UserPermission';

export const NationalUserRole = z.enum([
  'Administrator',
  'NationalCoordinator',
  'NationalObserver'
]);

export const RegionalAndNationUserRole = z.enum(['SamplerAndNationalObserver']);

export const RegionalUserRole = z.enum([
  'RegionalCoordinator',
  'RegionalObserver',
  'Sampler'
]);

export const UserRole = z.enum([
  ...NationalUserRole.options,
  ...RegionalAndNationUserRole.options,
  ...RegionalUserRole.options
]);

export type NationalUserRole = z.infer<typeof NationalUserRole>;
export type RegionalUserRole = z.infer<typeof RegionalUserRole>;
export type UserRole = z.infer<typeof UserRole>;

export const UserRoleList: UserRole[] = UserRole.options;

const UserSamplerPermissionsList = [
  'readProgrammingPlans',
  'readProgrammingPlanValidated',
  'readPrescriptions',
  'downloadSupportDocument',
  'createSample',
  'readSamples',
  'updateSample',
  'deleteSample',
  'downloadAnalysisRequestDocument',
  'readDocuments',
  'readCompanies',
  'createAnalysis',
  'readAnalysis',
  'deleteSampleDocument'
] as const satisfies UserPermission[];

const ObserverPermissionsList = [
  'readSamples',
  'downloadSupportDocument',
  'downloadAnalysisRequestDocument',
  'readProgrammingPlans',
  'readProgrammingPlansInProgress',
  'readProgrammingPlanSubmitted',
  'readProgrammingPlanApproved',
  'readProgrammingPlanValidated',
  'readProgrammingPlanClosed',
  'readPrescriptions',
  'readDocuments',
  'readCompanies',
  'readAnalysis'
] as const satisfies UserPermission[];

export const UserRolePermissions: Record<UserRole, UserPermission[]> = {
  NationalCoordinator: [
    'manageProgrammingPlan',
    'readProgrammingPlans',
    'readProgrammingPlansInProgress',
    'readProgrammingPlanSubmitted',
    'readProgrammingPlanApproved',
    'readProgrammingPlanValidated',
    'createPrescription',
    'readPrescriptions',
    'downloadSupportDocument',
    'updatePrescription',
    'deletePrescription',
    'commentPrescription',
    'readSamples',
    'createResource',
    'readDocuments',
    'deleteDocument',
    'readCompanies',
    'readAnalysis'
  ],
  RegionalCoordinator: [
    ...UserSamplerPermissionsList,
    'readProgrammingPlanSubmitted',
    'readProgrammingPlanApproved',
    'approveProgrammingPlan',
    'updatePrescriptionLaboratory',
    'commentPrescription',
    'deleteDocument'
  ],
  NationalObserver: ObserverPermissionsList,
  RegionalObserver: ObserverPermissionsList,
  SamplerAndNationalObserver: [
    ...ObserverPermissionsList,
    ...UserSamplerPermissionsList
  ],
  Sampler: UserSamplerPermissionsList,
  Administrator: [
    'readSamples',
    'downloadSupportDocument',
    'downloadAnalysisRequestDocument',
    'readProgrammingPlans',
    'readProgrammingPlansInProgress',
    'readProgrammingPlanSubmitted',
    'readProgrammingPlanApproved',
    'readProgrammingPlanValidated',
    'readProgrammingPlanClosed',
    'readPrescriptions',
    'createResource',
    'readDocuments',
    'deleteDocument',
    'readCompanies',
    'readAnalysis',
    'restoreSampleToReview'
  ]
};

export const UserRoleLabels: Record<UserRole, string> = {
  NationalCoordinator: 'Coordinateur national',
  RegionalCoordinator: 'Coordinateur régional',
  NationalObserver: 'Suivi national',
  RegionalObserver: 'Suivi régional',
  SamplerAndNationalObserver: 'Personne ressource',
  Sampler: 'Préleveur',
  Administrator: 'Administrateur'
};
