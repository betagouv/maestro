import { z } from 'zod';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'deleteSample',
  'readProgrammingPlans',
  'readProgrammingPlansInProgress',
  'createPrescription',
  'readPrescriptions',
  'updatePrescriptionSampleCount',
  'updatePrescriptionLaboratory',
  'deletePrescription',
  'createDocument',
  'readDocuments',
  'deleteDocument',
  '',
]);

export type UserPermission = z.infer<typeof UserPermission>;

export const UserPermissionList: UserPermission[] = [
  'createSample',
  'readSamples',
  'readProgrammingPlans',
  'readProgrammingPlansInProgress',
  'updateSample',
  'deleteSample',
  'createPrescription',
  'readPrescriptions',
  'updatePrescriptionSampleCount',
  'updatePrescriptionLaboratory',
  'deletePrescription',
  'createDocument',
  'readDocuments',
  'deleteDocument',
];
