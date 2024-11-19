import { z } from 'zod';
import { Stage } from '../../referential/Stage';
import { Context } from '../ProgrammingPlan/Context';

export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  context: Context,
  matrix: z.string().nullish(),
  stage: Stage.nullish(),
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
