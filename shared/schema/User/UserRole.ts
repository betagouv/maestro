import { z } from 'zod';
import { UserPermission, UserPermissionList } from './UserPermission';

export const UserRole = z.enum([
  'Administrator',
  'NationalCoordinator',
  'RegionalCoordinator',
  'Sampler',
]);

export type UserRole = z.infer<typeof UserRole>;

export const UserRoleList: UserRole[] = UserRole.options;

export const UserRolePermissions: Record<UserRole, UserPermission[]> = {
  NationalCoordinator: [
    'manageProgrammingPlan',
    'readProgrammingPlans',
    'readProgrammingPlansInProgress',
    'readProgrammingPlanSubmitted',
    'readProgrammingPlanValidated',
    'createPrescription',
    'readPrescriptions',
    'updatePrescriptionSampleCount',
    'deletePrescription',
    'readSamples',
    'createResource',
    'readDocuments',
    'deleteDocument',
    'readCompanies',
  ],
  RegionalCoordinator: [
    'readProgrammingPlans',
    'readProgrammingPlanSubmitted',
    'readProgrammingPlanValidated',
    'readPrescriptions',
    'updatePrescriptionLaboratory',
    'readSamples',
    'readDocuments',
    'readCompanies',
  ],
  Sampler: [
    'readProgrammingPlanValidated',
    'readPrescriptions',
    'createSample',
    'readSamples',
    'updateSample',
    'deleteSample',
    'downloadSupportDocument',
    'downloadAnalysisRequestDocument',
    'readDocuments',
    'readCompanies',
    'createAnalysis',
    'readAnalysis',
  ],
  Administrator: UserPermissionList,
};

export const UserRoleLabels: Record<UserRole, string> = {
  NationalCoordinator: 'Coordinateur national',
  RegionalCoordinator: 'Coordinateur régional',
  Sampler: 'Préleveur',
  Administrator: 'Administrateur',
};
