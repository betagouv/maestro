import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { Stage, StageLabels } from '../../referential/Stage';
import { Context } from '../ProgrammingPlan/Context';

export const Prescription = z.object({
  id: z.string().uuid(),
  programmingPlanId: z.string().uuid(),
  context: Context,
  matrix: Matrix,
  stages: z.array(Stage),
});

export const PrescriptionToCreate = Prescription.omit({
  id: true,
});

export const PrescriptionUpdate = Prescription.pick({
  programmingPlanId: true,
  stages: true,
});

export type Prescription = z.infer<typeof Prescription>;
export type PrescriptionToCreate = z.infer<typeof PrescriptionToCreate>;
export type PrescriptionUpdate = z.infer<typeof PrescriptionUpdate>;

export const PrescriptionSort = (a: Prescription, b: Prescription) =>
  [
    a.programmingPlanId,
    MatrixLabels[a.matrix],
    ...a.stages.map((_) => StageLabels[_]),
  ]
    .join()
    .localeCompare(
      [
        b.programmingPlanId,
        MatrixLabels[b.matrix],
        ...b.stages.map((_) => StageLabels[_]),
      ].join()
    );
