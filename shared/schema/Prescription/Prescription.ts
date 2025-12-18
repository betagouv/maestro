import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels
} from '../../referential/Matrix/MatrixKind';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { Stage, StageLabels } from '../../referential/Stage';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlan } from '../ProgrammingPlan/ProgrammingPlans';
import { hasPermission } from '../User/User';
import { UserRole } from '../User/UserRole';
import { PrescriptionSubstance } from './PrescriptionSubstance';

export const Prescription = z.object({
  id: z.guid(),
  programmingPlanId: z.guid(),
  programmingPlanKind: ProgrammingPlanKind,
  context: ProgrammingPlanContext,
  matrixKind: MatrixKind,
  matrix: Matrix.nullish(),
  stages: z.array(Stage),
  monoAnalysisCount: z.coerce.number().nullish(),
  multiAnalysisCount: z.coerce.number().nullish(),
  notes: z.string().nullish(),
  programmingInstruction: z.string().nullish()
});

export const PrescriptionToCreate = Prescription.omit({
  id: true
});

export const PrescriptionUpdate = z.object({
  programmingPlanId: z.guid(),
  ...Prescription.pick({
    stages: true,
    notes: true,
    programmingInstruction: true
  }).partial().shape,
  substances: z
    .array(
      PrescriptionSubstance.pick({
        analysisMethod: true,
        substance: true
      })
    )
    .nullish()
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
  userRole: UserRole,
  programmingPlan: ProgrammingPlan
): Record<PrescriptionPermission, boolean> => ({
  create:
    hasPermission(userRole, 'createPrescription') &&
    programmingPlan.regionalStatus.some(
      (regionalStatus) => regionalStatus.status !== 'Closed'
    ),
  update:
    hasPermission(userRole, 'updatePrescription') &&
    programmingPlan.regionalStatus.some(
      (regionalStatus) => regionalStatus.status !== 'Closed'
    ),
  delete:
    hasPermission(userRole, 'deletePrescription') &&
    programmingPlan.regionalStatus.some(
      (regionalStatus) => regionalStatus.status !== 'Closed'
    )
});

export const getPrescriptionTitle = (prescription: Prescription) =>
  prescription.matrix
    ? MatrixLabels[prescription.matrix]
    : MatrixKindLabels[prescription.matrixKind];
