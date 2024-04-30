import { z } from 'zod';
import { SampleStatus } from './SampleStatus';
export const FindSampleOptions = z.object({
  programmingPlanId: z.string().uuid().optional().nullable(),
  status: SampleStatus.optional().nullable(),
});

export type FindSampleOptions = z.infer<typeof FindSampleOptions>;
