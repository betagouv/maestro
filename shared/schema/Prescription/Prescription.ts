import { z } from 'zod';
import {
  MatrixKind,
  MatrixKindLabels
} from '../../referential/Matrix/MatrixKind';
import { Stage, StageLabels } from '../../referential/Stage';
import { Context } from '../ProgrammingPlan/Context';
import { ProgrammingPlan } from '../ProgrammingPlan/ProgrammingPlans';
import { hasPermission, User } from '../User/User';
import { PrescriptionSubstance } from './PrescriptionSubstance';

export const Prescription = z.object({
  id: z.string().uuid(),
  programmingPlanId: z.string().uuid(),
  context: Context,
  matrixKind: MatrixKind,
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
    MatrixKindLabels[a.matrixKind],
    ...a.stages.map((_) => StageLabels[_])
  ]
    .join()
    .localeCompare(
      [
        b.programmingPlanId,
        MatrixKindLabels[b.matrixKind],
        ...b.stages.map((_) => StageLabels[_])
      ].join()
    );

const PrescriptionPermission = z.enum(['create', 'update', 'delete']);

export type PrescriptionPermission = z.infer<typeof PrescriptionPermission>;

export const hasPrescriptionPermission = (
  user: User,
  programmingPlan: ProgrammingPlan
): Record<PrescriptionPermission, boolean> => ({
  create:
    hasPermission(user, 'createPrescription') &&
    programmingPlan.regionalStatus.some(
      (regionalStatus) => regionalStatus.status !== 'Closed'
    ),
  update:
    hasPermission(user, 'updatePrescription') &&
    programmingPlan.regionalStatus.some(
      (regionalStatus) => regionalStatus.status !== 'Closed'
    ),
  delete:
    hasPermission(user, 'deletePrescription') &&
    programmingPlan.regionalStatus.some(
      (regionalStatus) => regionalStatus.status !== 'Closed'
    )
});
