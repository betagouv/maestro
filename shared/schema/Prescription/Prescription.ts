import { z } from 'zod';
import { MatrixKindLabels } from '../../referential/Matrix/MatrixKind';
import { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import type { ProgrammingPlanChecked } from '../ProgrammingPlan/ProgrammingPlans';
import {
  findPrescriptionSubPlan,
  getSubPlanMatrixTitle,
  ProgrammingSubPlanId
} from '../ProgrammingPlan/ProgrammingSubPlan';
import { hasPermission } from '../User/User';
import type { UserRole } from '../User/UserRole';
import { PrescriptionSubstance } from './PrescriptionSubstance';

export const Prescription = z.object({
  id: z.guid(),
  programmingSubPlanId: ProgrammingSubPlanId,
  context: ProgrammingPlanContext,
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
            [
              programmingPlan.title,
              subPlan.subPlanNumber,
              subPlan.matrixKind ? MatrixKindLabels[subPlan.matrixKind] : ''
            ] as const
          ] as const
      )
    )
  );

  const sortKey = (prescription: T) => {
    const subPlanKey = subPlanKeys.get(prescription.programmingSubPlanId);
    return [subPlanKey ? '0' : '1', ...(subPlanKey ?? ['', '', ''])].join();
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

export const getPrescriptionTitle = (
  programmingPlans: Pick<ProgrammingPlanChecked, 'subPlans'>[],
  prescription: Pick<Prescription, 'programmingSubPlanId'>
): string => {
  const subPlan = findPrescriptionSubPlan(programmingPlans, prescription);
  return (subPlan && getSubPlanMatrixTitle(subPlan)) ?? '';
};
