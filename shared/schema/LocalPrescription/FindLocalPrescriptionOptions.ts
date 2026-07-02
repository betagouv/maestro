import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';

export const LocalPrescriptionOptionsInclude = z.enum([
  'comments',
  'sampleCounts',
  'laboratories'
]);

export type LocalPrescriptionOptionsInclude = z.infer<
  typeof LocalPrescriptionOptionsInclude
>;

export const FindLocalPrescriptionOptions = z.object({
  programmingPlanIds: z.array(z.guid()).min(1).nullish(),
  prescriptionId: z.guid().nullish(),
  programmingSubPlanIds: z.array(ProgrammingSubPlanId).nullish(),
  contexts: z.array(ProgrammingPlanContext).nullish(),
  region: Region.nullish(),
  department: Department.nullish(),
  companySirets: z.array(z.string()).nullish(),
  includes: z.array(LocalPrescriptionOptionsInclude).nullish()
});

export type FindLocalPrescriptionOptions = z.infer<
  typeof FindLocalPrescriptionOptions
>;
