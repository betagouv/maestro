import { z } from 'zod';
import { Matrix } from '../../referential/Matrix/Matrix';
import {
  MatrixKind,
  MatrixKindLabels
} from '../../referential/Matrix/MatrixKind';
import { MatrixLabels } from '../../referential/Matrix/MatrixLabels';
import { SubStage, SubStageLabels } from '../../referential/SubStage';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import type { ProgrammingPlanChecked } from '../ProgrammingPlan/ProgrammingPlans';
import { ProgrammingSubPlanId } from '../ProgrammingPlan/ProgrammingSubPlan';
import { hasPermission } from '../User/User';
import type { UserRole } from '../User/UserRole';
import { PrescriptionSubstance } from './PrescriptionSubstance';

export const Prescription = z.object({
  id: z.guid(),
  programmingPlanId: z.guid(),
  programmingSubPlanId: ProgrammingSubPlanId,
  context: ProgrammingPlanContext,
  matrixKind: MatrixKind,
  matrix: Matrix.nullish(),
  stages: z.array(SubStage),
  sampleCount: z.coerce.number().int().min(0).default(0),
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
    programmingInstruction: true,
    sampleCount: true
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

export const sortPrescriptions = <T extends Prescription>(
  prescriptions: T[],
  programmingPlans: Pick<ProgrammingPlanChecked, 'title' | 'subPlans'>[]
): T[] => {
  const subPlanKeys = new Map(
    programmingPlans.flatMap((programmingPlan) =>
      programmingPlan.subPlans.map(
        (subPlan) =>
          [
            subPlan.id,
            [programmingPlan.title, subPlan.subPlanNumber] as const
          ] as const
      )
    )
  );

  const sortKey = (prescription: T) => {
    const subPlanKey = subPlanKeys.get(prescription.programmingSubPlanId);
    return [
      subPlanKey ? '0' : '1',
      ...(subPlanKey ?? ['', '']),
      MatrixKindLabels[prescription.matrixKind],
      ...prescription.stages.map((_) => SubStageLabels[_])
    ].join();
  };

  return prescriptions.toSorted((a, b) => sortKey(a).localeCompare(sortKey(b)));
};

const PrescriptionPermission = z.enum(['create', 'update', 'delete']);

export type PrescriptionPermission = z.infer<typeof PrescriptionPermission>;

export const hasPrescriptionPermission = (
  userRole: UserRole,
  programmingPlan: ProgrammingPlanChecked
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
