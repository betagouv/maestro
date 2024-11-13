import { z } from 'zod';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'deleteSample',
  'downloadSupportDocument',
  'downloadAnalysisRequestDocument',
  'manageProgrammingPlan',
  'readProgrammingPlans',
  'readProgrammingPlansInProgress',
  'readProgrammingPlanSubmitted',
  'readProgrammingPlanValidated',
  'createPrescription',
  'readPrescriptions',
  'updatePrescriptionSampleCount',
  'updatePrescriptionLaboratory',
  'deletePrescription',
  'commentPrescription',
  'createResource',
  'readDocuments',
  'deleteDocument',
  'readCompanies',
  'createAnalysis',
  'readAnalysis',
]);

export type UserPermission = z.infer<typeof UserPermission>;

export const UserPermissionList: UserPermission[] = UserPermission.options;
