import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Matrix } from '../../referential/Matrix/Matrix';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingPlanDomainId } from '../ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';

export const PrescriptionOptionsInclude = z.enum(['substanceCount']);

export type PrescriptionOptionsInclude = z.infer<
  typeof PrescriptionOptionsInclude
>;

export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.guid().nullish(),
  programmingPlanIds: z.array(z.guid()).min(1).nullish(),
  year: z.number().int().nullish(),
  programmingSubPlanIds: z.array(ProgrammingSubPlanId).nullish(),
  programmingPlanDomainIds: z.array(ProgrammingPlanDomainId).nullish(),
  contexts: z.array(ProgrammingPlanContext).nullish(),
  matrixKind: z.string().nullish(),
  matrices: z.array(Matrix).nullish(),
  subPlanStage: Stage.nullish(),
  coordinatorIds: z.array(z.guid()).nullish(),
  laboratoryIds: z.array(z.guid()).nullish(),
  region: Region.nullish(),
  department: Department.nullish(),
  missingSlaughterhouse: z.boolean().nullish(),
  missingLaboratory: z.boolean().nullish(),
  withSampleCountOnly: z.boolean().nullish(),
  includes: z.array(PrescriptionOptionsInclude).nullish()
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
