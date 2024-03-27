import { z } from 'zod';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'createPrescription',
  'readPrescriptions',
  'updatePrescription',
  'deletePrescription',
]);

export type UserPermission = z.infer<typeof UserPermission>;

export const UserPermissionList: UserPermission[] = [
  'createSample',
  'readSamples',
  'updateSample',
  'createPrescription',
  'readPrescriptions',
  'updatePrescription',
  'deletePrescription',
];
