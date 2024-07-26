import { z } from 'zod';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  region: Region.nullish(),
  matrix: z.string().nullish(),
  stage: Stage.nullish(),
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
