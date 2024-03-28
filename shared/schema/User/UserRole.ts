import { z } from 'zod';
import { UserPermission, UserPermissionList } from './UserPermission';

export const UserRole = z.enum([
  'Administrator',
  'NationalCoordinator',
  'RegionalCoordinator',
  'Sampler',
]);

export type UserRole = z.infer<typeof UserRole>;

export const UserRoleList: UserRole[] = [
  'Administrator',
  'NationalCoordinator',
  'RegionalCoordinator',
  'Sampler',
];

export const UserRolePermissions: Record<UserRole, UserPermission[]> = {
  NationalCoordinator: [
    'readProgrammingPlans',
    'createPrescription',
    'readPrescriptions',
    'updatePrescription',
    'deletePrescription',
  ],
  RegionalCoordinator: ['readProgrammingPlans', 'readPrescriptions'],
  Sampler: ['createSample', 'readSamples', 'updateSample'],
  Administrator: UserPermissionList,
};

export const UserRoleLabels: Record<UserRole, string> = {
  NationalCoordinator: 'Coordinateur national',
  RegionalCoordinator: 'Coordinateur régional',
  Sampler: 'Préleveur',
  Administrator: 'Administrateur',
};
