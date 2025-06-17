import { z } from 'zod/v4';

export const UserPermission = z.enum([
  'createSample',
  'readSamples',
  'updateSample',
  'deleteSample',
  'downloadSupportDocument',
  'downloadAnalysisRequestDocument',
  'manageProgrammingPlan',
  'approveProgrammingPlan',
  'closeProgrammingPlan',
  'readProgrammingPlans',
  'readProgrammingPlansInProgress',
  'readProgrammingPlanSubmitted',
  'readProgrammingPlanApproved',
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
