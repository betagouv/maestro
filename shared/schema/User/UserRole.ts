import { z } from 'zod';
import type { Region } from '../../referential/Region';
import type { Nullable } from '../../utils/typescript';
import type { UserRefined } from './User';
import type { UserPermission } from './UserPermission';

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
  'viewProgrammingPlans',
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
  'viewProgrammingPlans',
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
    'viewProgrammingPlans',
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
    'exportSamplesWithCodes'
  ],
  RegionalCoordinator: [
    'viewProgrammingPlans',
    'readProgrammingPlanValidated',
    'readProgrammingPlanClosed',
    'readProgrammingPlanSubmittedToRegion',
    'readProgrammingPlanApprovedByRegion',
    'readProgrammingPlanSubmittedToDepartments',
    'approveProgrammingPlan',
    'readPrescriptions',
    'downloadSupportDocument',
    'readSamples',
    'downloadAnalysisRequestDocument',
    'readDocuments',
    'readCompanies',
    'readAnalysis',
    'viewDashboard',
    'updatePrescriptionLaboratories',
    'commentPrescription',
    'distributePrescriptionToDepartments',
    'deleteDocument'
  ],
  NationalObserver: ObserverPermissionsList,
  RegionalObserver: ObserverPermissionsList,
  Sampler: UserSamplerPermissionsList,
  DepartmentalCoordinator: [
    'viewProgrammingPlans',
    'readProgrammingPlanValidated',
    'readProgrammingPlanClosed',
    'readPrescriptions',
    'downloadSupportDocument',
    'readSamples',
    'downloadAnalysisRequestDocument',
    'readDocuments',
    'readCompanies',
    'readAnalysis',
    'viewDashboard',
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
    'viewProgrammingPlans',
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
    'viewDashboard'
  ],
  LaboratoryUser: ['readDocuments', 'readProgrammingPlanValidated']
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

export const isDepartmentalRole = (userRole?: UserRole) =>
  //FIXME un sampler c'est pas un role départemental?!
  DepartmentalUserRole.safeParse(userRole).success;

export const canHaveDepartment = (
  user: Nullable<Pick<UserRefined, 'roles'>>
): user is {
  roles: (z.infer<typeof DepartmentalUserRole> | 'Sampler')[];
  region: Region;
} =>
  //FIXME bouger la condition « role === 'Sampler' », dans isDepartmentalRole?
  user?.roles?.some((role) => isDepartmentalRole(role) || role === 'Sampler') ??
  false;
