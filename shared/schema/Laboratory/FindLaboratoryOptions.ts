import { z } from 'zod';
import { SubstanceKind } from '../Substance/SubstanceKind';

export const FindLaboratoryOptions = z.object({
  programmingPlanId: z.guid().nullish(),
  substanceKind: SubstanceKind.nullish()
});

export type FindLaboratoryOptions = z.infer<typeof FindLaboratoryOptions>;
