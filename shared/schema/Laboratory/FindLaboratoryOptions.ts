import { z } from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const FindLaboratoryOptions = z.object({
  programmingPlanId: z.guid().nullish(),
  substanceKind: SubstanceKind.nullish(),
  programmingPlanKind: ProgrammingPlanKind.nullish()
});

export type FindLaboratoryOptions = z.infer<typeof FindLaboratoryOptions>;
