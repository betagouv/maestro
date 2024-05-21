import { z } from 'zod';
import { Region } from '../Region';
import { SampleStage } from '../Sample/SampleStage';
export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  region: Region.optional().nullable(),
  sampleMatrix: z.string().optional().nullable(),
  sampleStage: SampleStage.optional().nullable(),
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
