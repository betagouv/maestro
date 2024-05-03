import { z } from 'zod';
import { Region } from '../Region';
export const FindPrescriptionOptions = z.object({
  programmingPlanId: z.string().uuid(),
  region: Region.optional().nullable(),
});

export type FindPrescriptionOptions = z.infer<typeof FindPrescriptionOptions>;
