import { z } from 'zod';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'deleteSample',
  'downloadSampleDocument',
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
  'downloadSampleDocument',
  'createPrescription',
  'readPrescriptions',
  'updatePrescriptionSampleCount',
  'updatePrescriptionLaboratory',
  'deletePrescription',
  'createDocument',
  'readDocuments',
  'deleteDocument',
];
