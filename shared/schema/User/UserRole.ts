import { z } from 'zod';
import { Region } from '../../referential/Region';
import { Nullable } from '../../utils/typescript';
import { User } from './User';
import { UserPermission } from './UserPermission';

const NationalUserRole = z.enum([
  'Administrator',
  'NationalCoordinator',
  'NationalObserver',
  'LaboratoryUser'
]);

const RegionalAndNationalUserRole = z.enum(['SamplerAndNationalObserver']);

const RegionalUserRole = z.enum(['RegionalCoordinator', 'RegionalObserver']);

export const UserRole = z.enum(
  [
    ...NationalUserRole.options,
    ...RegionalAndNationalUserRole.options,
    ...RegionalUserRole.options,
    'DepartmentalCoordinator',
    'Sampler'
  ],
  { error: 'Veuillez renseigner un rôle.' }
);

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
  DepartmentalCoordinator: [
    ...UserSamplerPermissionsList,
    'readProgrammingPlanSubmittedToDepartments',
    'validateProgrammingPlan',
    'updatePrescriptionLaboratories',
    'distributePrescriptionToSlaughterhouses',
    'commentPrescription'
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
  ],
  LaboratoryUser: ['readDocuments']
};

export const UserRoleLabels: Record<UserRole, string> = {
  NationalCoordinator: 'Coordinateur national',
  RegionalCoordinator: 'Coordinateur régional',
  NationalObserver: 'Suivi national',
  RegionalObserver: 'Suivi régional',
  DepartmentalCoordinator: 'Coordinateur départemental',
  SamplerAndNationalObserver: 'Personne ressource',
  Sampler: 'Préleveur',
  Administrator: 'Administrateur',
  LaboratoryUser: 'Laboratoire'
};

export const UserRoleSorted = [...UserRoleList].sort((a, b) =>
  UserRoleLabels[a].localeCompare(UserRoleLabels[b])
);

export const hasNationalRole = (user: Nullable<Pick<User, 'role'>>) =>
  NationalUserRole.safeParse(user.role).success ||
  RegionalAndNationalUserRole.safeParse(user.role).success;

export const hasRegionalRole = (
  user: Nullable<Pick<User, 'role'>>
): user is {
  role:
    | z.infer<typeof RegionalUserRole>
    | z.infer<typeof RegionalAndNationalUserRole>;
  region: Region;
} =>
  RegionalUserRole.safeParse(user.role).success ||
  RegionalAndNationalUserRole.safeParse(user.role).success;

export const canHaveDepartment = (
  user: Nullable<Pick<User, 'role'>>
): user is {
  role: 'DepartmentalCoordinator' | 'Sampler';
  region: Region;
} => user.role === 'DepartmentalCoordinator' || user.role === 'Sampler';
