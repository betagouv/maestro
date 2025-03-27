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
  'readProgrammingPlanClosed',
  'createPrescription',
  'readPrescriptions',
  'updatePrescription',
  'updatePrescriptionLaboratory',
  'deletePrescription',
  'commentPrescription',
  'createResource',
  'readDocuments',
  'deleteDocument',
  'deleteSampleDocument',
  'readCompanies',
  'createAnalysis',
  'readAnalysis',
  'restoreSampleToReview'
]);

export type UserPermission = z.infer<typeof UserPermission>;

export const UserPermissionList: UserPermission[] = UserPermission.options;
