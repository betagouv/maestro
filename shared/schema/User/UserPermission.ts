import { z } from 'zod';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'deleteSample',
  'downloadSupportDocument',
  'downloadAnalysisRequestDocument',
  'createProgrammingPlan',
  'readProgrammingPlans',
  'readProgrammingPlansInProgress',
  'createPrescription',
  'readPrescriptions',
  'updatePrescriptionSampleCount',
  'updatePrescriptionLaboratory',
  'deletePrescription',
  'createResource',
  'readDocuments',
  'deleteDocument',
  'readCompanies',
  'createAnalysis',
  'readAnalysis',
]);

export type UserPermission = z.infer<typeof UserPermission>;

export const UserPermissionList: UserPermission[] = UserPermission.options;
