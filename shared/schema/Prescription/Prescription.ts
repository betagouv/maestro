import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { Context } from '../ProgrammingPlan/Context';
import { PrescriptionComment } from './PrescriptionComment';

export const Prescription = z.object({
  id: z.string().uuid(),
  programmingPlanId: z.string().uuid(),
  context: Context,
  region: Region,
  matrix: Matrix,
  stages: z.array(Stage),
  sampleCount: z.number(),
  laboratoryId: z.string().nullish(),
  comments: z
    .array(
      PrescriptionComment.pick({
        id: true,
        comment: true,
        createdAt: true,
        createdBy: true,
      })
    )
    .nullish(),
});

export const PrescriptionsToCreate = z.object({
  programmingPlanId: z.string().uuid(),
  context: Context,
  prescriptions: z.array(
    Prescription.pick({
      region: true,
      matrix: true,
      stages: true,
      sampleCount: true,
    })
  ),
});

export const PrescriptionUpdate = Prescription.pick({
  programmingPlanId: true,
  context: true,
}).merge(
  Prescription.pick({
    sampleCount: true,
    laboratoryId: true,
  }).partial()
);

export const PrescriptionsToDelete = z.object({
  programmingPlanId: z.string().uuid(),
  context: Context,
  prescriptionIds: z.array(z.string().uuid()),
});

export type Prescription = z.infer<typeof Prescription>;
export type PrescriptionsToCreate = z.infer<typeof PrescriptionsToCreate>;
export type PrescriptionUpdate = z.infer<typeof PrescriptionUpdate>;
export type PrescriptionsToDelete = z.infer<typeof PrescriptionsToDelete>;
