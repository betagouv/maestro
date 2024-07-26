import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';

export const Prescription = z.object({
  id: z.string().uuid(),
  programmingPlanId: z.string().uuid(),
  region: Region,
  matrix: Matrix,
  stages: z.array(Stage),
  sampleCount: z.number(),
  laboratoryId: z.string().nullish(),
});

export const PrescriptionToCreate = Prescription.pick({
  region: true,
  matrix: true,
  stages: true,
  sampleCount: true,
});

export const PrescriptionUpdate = Prescription.pick({
  sampleCount: true,
  laboratoryId: true,
}).partial();

export type Prescription = z.infer<typeof Prescription>;
export type PrescriptionToCreate = z.infer<typeof PrescriptionToCreate>;
export type PrescriptionUpdate = z.infer<typeof PrescriptionUpdate>;
