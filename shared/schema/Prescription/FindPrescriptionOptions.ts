import { z } from 'zod';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  region: Region.optional().nullable(),
  matrix: z.string().optional().nullable(),
  stage: Stage.optional().nullable(),
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
