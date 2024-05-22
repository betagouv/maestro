import { z } from 'zod';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  region: Region.optional().nullable(),
  sampleMatrix: z.string().optional().nullable(),
  sampleStage: Stage.optional().nullable(),
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
