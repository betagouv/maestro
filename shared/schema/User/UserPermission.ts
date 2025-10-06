import { z } from 'zod';

export const UserPermission = z.enum([
  'administrationMaestro',
  'createSample',
  'readSamples',
  'updateSample',
  'deleteSample',
  'downloadSupportDocument',
  'downloadAnalysisRequestDocument',
  'manageProgrammingPlan',
  'approveProgrammingPlan',
  'validateProgrammingPlan',
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
  'distributePrescriptionToDepartments',
  'distributePrescriptionToSlaughterhouses',
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
