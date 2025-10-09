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

export const DepartmentalUserRole = z.enum([
  'DepartmentalCoordinator',
  'DepartmentalSampler'
]);

export const UserRole = z.enum([
  ...NationalUserRole.options,
  ...RegionalAndNationUserRole.options,
  ...RegionalUserRole.options,
  ...DepartmentalUserRole.options
]);

export type NationalUserRole = z.infer<typeof NationalUserRole>;
export type RegionalUserRole = z.infer<typeof RegionalUserRole>;
export type UserRole = z.infer<typeof UserRole>;

export const UserRoleList: UserRole[] = UserRole.options;

const UserSamplerPermissionsList = [
  'readProgrammingPlans',
  'readProgrammingPlanValidated',
  'readProgrammingPlanClosed',
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
  'readProgrammingPlanSubmittedToRegion',
  'readProgrammingPlanApprovedByRegion',
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
    'closeProgrammingPlan',
    'readProgrammingPlans',
    'readProgrammingPlansInProgress',
    'readProgrammingPlanSubmittedToRegion',
    'readProgrammingPlanApprovedByRegion',
    'readProgrammingPlanSubmittedToDepartments',
    'readProgrammingPlanValidated',
    'readProgrammingPlanClosed',
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
    'readProgrammingPlanSubmittedToRegion',
    'readProgrammingPlanApprovedByRegion',
    'readProgrammingPlanSubmittedToDepartments',
    'approveProgrammingPlan',
    'updatePrescriptionLaboratories',
    'commentPrescription',
    'distributePrescriptionToDepartments',
    'deleteDocument'
  ],
  NationalObserver: ObserverPermissionsList,
  RegionalObserver: ObserverPermissionsList,
  SamplerAndNationalObserver: [
    ...ObserverPermissionsList,
    ...UserSamplerPermissionsList
  ],
  Sampler: UserSamplerPermissionsList,
  DepartmentalSampler: UserSamplerPermissionsList,
  DepartmentalCoordinator: [
    ...UserSamplerPermissionsList,
    'readProgrammingPlanSubmittedToDepartments',
    'validateProgrammingPlan',
    'updatePrescriptionLaboratories',
    'distributePrescriptionToSlaughterhouses'
  ],
  Administrator: [
    'administrationMaestro',
    'readSamples',
    'downloadSupportDocument',
    'downloadAnalysisRequestDocument',
    'readProgrammingPlans',
    'readProgrammingPlansInProgress',
    'readProgrammingPlanSubmittedToRegion',
    'readProgrammingPlanApprovedByRegion',
    'readProgrammingPlanSubmittedToDepartments',
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
  DepartmentalCoordinator: 'Coordinateur départemental',
  SamplerAndNationalObserver: 'Personne ressource',
  Sampler: 'Préleveur',
  DepartmentalSampler: 'Préleveur',
  Administrator: 'Administrateur'
};
