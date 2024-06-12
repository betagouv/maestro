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
    'readProgrammingPlans',
    'readProgrammingPlansInProgress',
    'createPrescription',
    'readPrescriptions',
    'updatePrescriptionSampleCount',
    'deletePrescription',
    'readSamples',
    'createDocument',
    'readDocuments',
    'deleteDocument',
    'readCompanies',
  ],
  RegionalCoordinator: [
    'readProgrammingPlans',
    'readProgrammingPlansInProgress',
    'readPrescriptions',
    'updatePrescriptionLaboratory',
    'readSamples',
    'readDocuments',
    'readCompanies',
  ],
  Sampler: [
    'readProgrammingPlans',
    'readPrescriptions',
    'createSample',
    'readSamples',
    'updateSample',
    'deleteSample',
    'downloadSupportDocument',
    'downloadAnalysisRequestDocument',
    'readDocuments',
    'readCompanies',
  ],
  Administrator: UserPermissionList,
};

export const UserRoleLabels: Record<UserRole, string> = {
  NationalCoordinator: 'Coordinateur national',
  RegionalCoordinator: 'Coordinateur régional',
  Sampler: 'Préleveur',
  Administrator: 'Administrateur',
};
