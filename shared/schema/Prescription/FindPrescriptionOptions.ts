import { z } from 'zod';
import { Stage } from '../../referential/Stage';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';

export const PrescriptionOptionsInclude = z.enum(['substanceCount']);

export type PrescriptionOptionsInclude = z.infer<
  typeof PrescriptionOptionsInclude
>;

export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.guid().nullish(),
  year: z.number().int().nullish(),
  programmingSubPlanIds: z.array(ProgrammingSubPlanId).nullish(),
  contexts: z.array(ProgrammingPlanContext).nullish(),
  matrixKind: z.string().nullish(),
  stage: Stage.nullish(),
  matrix: z.string().nullish(),
  includes: z.array(PrescriptionOptionsInclude).nullish()
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
