import { z } from 'zod';
import { UserPermission, UserPermissionList } from './UserPermission';

export const NationalUserRole = z.enum([
  'Administrator',
  'NationalCoordinator',
  'NationalObserver',
  'SamplerAndNationalObserver'
]);

export const RegionalUserRole = z.enum([
  'RegionalCoordinator',
  'RegionalObserver',
  'Sampler'
]);

export const UserRole = z.enum([
  ...NationalUserRole.options,
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
  'readProgrammingPlanValidated',
  'readProgrammingPlanClosed',
  'readPrescriptions',
  'readDocuments',
  'readAnalysis'
] as const satisfies UserPermission[];

export const UserRolePermissions: Record<UserRole, UserPermission[]> = {
  NationalCoordinator: [
    'manageProgrammingPlan',
    'readProgrammingPlans',
    'readProgrammingPlansInProgress',
    'readProgrammingPlanSubmitted',
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
    'readCompanies'
  ],
  RegionalCoordinator: [
    ...UserSamplerPermissionsList,
    'readProgrammingPlanSubmitted',
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
  Administrator: UserPermissionList.filter(
    (permission) =>
      !['createSample', 'updateSample', 'deleteSample'].includes(permission)
  )
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
