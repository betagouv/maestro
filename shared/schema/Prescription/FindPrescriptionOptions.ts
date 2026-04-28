import { z } from 'zod';
import { Stage } from '../../referential/Stage';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export const PrescriptionOptionsInclude = z.enum(['substanceCount']);

export type PrescriptionOptionsInclude = z.infer<
  typeof PrescriptionOptionsInclude
>;

export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.guid(),
  programmingPlanKinds: z.array(ProgrammingPlanKind).nullish(),
  contexts: z.array(ProgrammingPlanContext).nullish(),
  matrixKind: z.string().nullish(),
  stage: Stage.nullish(),
  includes: z.array(PrescriptionOptionsInclude).nullish()
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
