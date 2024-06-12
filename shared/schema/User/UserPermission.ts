import { z } from 'zod';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'deleteSample',
  'downloadSupportDocument',
  'downloadAnalysisRequestDocument',
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
  'readCompanies',
]);

export type UserPermission = z.infer<typeof UserPermission>;

export const UserPermissionList: UserPermission[] = UserPermission.options;
