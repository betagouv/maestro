import { z } from 'zod';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'readProgrammingPlans',
  'createPrescription',
  'readPrescriptions',
  'updatePrescription',
  'deletePrescription',
  'createDocument',
  'readDocuments',
  'deleteDocument',
]);

export type UserPermission = z.infer<typeof UserPermission>;

export const UserPermissionList: UserPermission[] = [
  'createSample',
  'readSamples',
  'readProgrammingPlans',
  'updateSample',
  'createPrescription',
  'readPrescriptions',
  'updatePrescription',
  'deletePrescription',
  'createDocument',
  'readDocuments',
  'deleteDocument',
];
