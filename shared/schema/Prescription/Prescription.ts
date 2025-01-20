import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { Stage, StageLabels } from '../../referential/Stage';
import { Context } from '../ProgrammingPlan/Context';
import { ProgrammingPlan } from '../ProgrammingPlan/ProgrammingPlans';
import { hasPermission, User, UserInfos } from '../User/User';
import { PrescriptionSubstance } from './PrescriptionSubstance';

export const Prescription = z.object({
  id: z.string().uuid(),
  programmingPlanId: z.string().uuid(),
  context: Context,
  matrix: Matrix,
  stages: z.array(Stage),
  monoAnalysisCount: z.coerce.number().nullish(),
  multiAnalysisCount: z.coerce.number().nullish(),
  notes: z.string().nullish()
});

export const PrescriptionToCreate = Prescription.omit({
  id: true
});

export const PrescriptionUpdate = z.object({
  programmingPlanId: z.string().uuid(),
  stages: z.array(Stage).nullish(),
  substances: z
    .array(
      PrescriptionSubstance.pick({
        analysisMethod: true,
        substance: true
      })
    )
    .nullish(),
  notes: z.string().nullish()
});

export type Prescription = z.infer<typeof Prescription>;
export type PrescriptionToCreate = z.infer<typeof PrescriptionToCreate>;
export type PrescriptionUpdate = z.infer<typeof PrescriptionUpdate>;

export const PrescriptionSort = (a: Prescription, b: Prescription) =>
  [
    a.programmingPlanId,
    MatrixLabels[a.matrix],
    ...a.stages.map((_) => StageLabels[_])
  ]
    .join()
    .localeCompare(
      [
        b.programmingPlanId,
        MatrixLabels[b.matrix],
        ...b.stages.map((_) => StageLabels[_])
      ].join()
    );

const PrescriptionPermission = z.enum(['create', 'update', 'delete']);

export type PrescriptionPermission = z.infer<typeof PrescriptionPermission>;

export const hasPrescriptionPermission = (
  user: User | UserInfos,
  programmingPlan: ProgrammingPlan
): Record<PrescriptionPermission, boolean> => ({
  create:
    hasPermission(user, 'createPrescription') &&
    (programmingPlan.status !== 'Closed' ||
      programmingPlan.statusDrom !== 'Closed'),
  update:
    hasPermission(user, 'updatePrescription') &&
    (programmingPlan.status !== 'Closed' ||
      programmingPlan.statusDrom !== 'Closed'),
  delete:
    hasPermission(user, 'deletePrescription') &&
    (programmingPlan.status !== 'Closed' ||
      programmingPlan.statusDrom !== 'Closed')
});
