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

const RegionalUserRole = z.enum(['RegionalCoordinator', 'RegionalObserver']);
const DepartmentalUserRole = z.enum([
  'DepartmentalCoordinator',
  'DepartmentalObserver'
]);

export const UserRole = z.enum(
  [
    ...NationalUserRole.options,
    ...RegionalUserRole.options,
    ...DepartmentalUserRole.options,
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
  'deleteSampleDocument',
  'viewDashboard'
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
  'readAnalysis',
  'viewDashboard'
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
    'readAnalysis',
    'viewDashboard',
    'readLaboratoryCompetences'
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
  Sampler: UserSamplerPermissionsList,
  DepartmentalCoordinator: [
    ...UserSamplerPermissionsList,
    'readProgrammingPlanSubmittedToDepartments',
    'validateProgrammingPlan',
    'updatePrescriptionLaboratories',
    'distributePrescriptionToSlaughterhouses',
    'commentPrescription'
  ],
  DepartmentalObserver: ObserverPermissionsList,
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
    'viewDashboard',
    'readLaboratoryCompetences'
  ],
  LaboratoryUser: [
    'readDocuments',
    'readLaboratoryCompetences',
    'manageLaboratoryCompetences'
  ]
};

export const UserRoleLabels: Record<UserRole, string> = {
  NationalCoordinator: 'Coordinateur national',
  RegionalCoordinator: 'Coordinateur régional',
  NationalObserver: 'Suivi national',
  RegionalObserver: 'Suivi régional',
  DepartmentalCoordinator: 'Coordinateur départemental',
  DepartmentalObserver: 'Suivi départemental',
  Sampler: 'Préleveur',
  Administrator: 'Administrateur',
  LaboratoryUser: 'Laboratoire'
};

export const UserRoleSorted = [...UserRoleList].sort((a, b) =>
  UserRoleLabels[a].localeCompare(UserRoleLabels[b])
);

export const isNationalRole = (userRole?: UserRole) =>
  NationalUserRole.safeParse(userRole).success;

export const isRegionalRole = (userRole?: UserRole) =>
  RegionalUserRole.safeParse(userRole).success;

export const canHaveDepartment = (
  user: Nullable<Pick<User, 'roles'>>
): user is {
  roles: (z.infer<typeof DepartmentalUserRole> | 'Sampler')[];
  region: Region;
} =>
  user?.roles?.some(
    (role) => DepartmentalUserRole.safeParse(role).success || role === 'Sampler'
  ) ?? false;
