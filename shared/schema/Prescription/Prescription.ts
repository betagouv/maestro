import { z } from 'zod';
import { Region } from '../Region';
import { SampleStage } from '../Sample/SampleStage';

export const Prescription = z.object({
  id: z.string().uuid(),
  programmingPlanId: z.string().uuid(),
  region: Region,
  sampleMatrix: z.string(),
  sampleStage: SampleStage,
  sampleCount: z.number(),
});

export const PrescriptionUpdate = Prescription.pick({
  sampleCount: true,
});

export type Prescription = z.infer<typeof Prescription>;
export type PrescriptionUpdate = z.infer<typeof PrescriptionUpdate>;
