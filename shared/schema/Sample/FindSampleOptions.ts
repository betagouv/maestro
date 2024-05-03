import { z } from 'zod';
import { Region } from '../Region';
import { SampleStatus } from './SampleStatus';
export const FindSampleOptions = z.object({
  programmingPlanId: z.string().uuid().optional().nullable(),
  region: Region.optional().nullable(),
  status: SampleStatus.optional().nullable(),
});

export type FindSampleOptions = z.infer<typeof FindSampleOptions>;
