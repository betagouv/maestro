import { z } from 'zod';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const FindLaboratoryOptions = z.object({
  programmingPlanIds: z.array(z.guid()).nullish(),
  substanceKind: SubstanceKind.nullish(),
  programmingSubPlanId: ProgrammingSubPlanId.nullish(),
  subPlanNumber: z.string().nullish()
});

export type FindLaboratoryOptions = z.infer<typeof FindLaboratoryOptions>;
