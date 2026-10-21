import { z } from 'zod';
import type { MatrixReferential } from '../Matrix/MatrixReferential';
import type { ProgrammingPlanChecked } from '../ProgrammingPlan/ProgrammingPlans';
import {
  findPrescriptionSubPlan,
  ProgrammingSubPlanId
} from '../ProgrammingPlan/ProgrammingSubPlan';
import { getSubPlanMatrixLabels } from '../ProgrammingPlan/SubPlanMatrices';
import { hasPermission } from '../User/User';
import type { UserRole } from '../User/UserRole';

export const Prescription = z.object({
  id: z.guid(),
  programmingSubPlanId: ProgrammingSubPlanId,
  sampleCount: z.coerce.number().int().min(0).default(0)
});

export const PrescriptionUpdate = z.object({
  programmingPlanId: z.guid(),
  ...Prescription.pick({
    sampleCount: true
  }).partial().shape
});

export type Prescription = z.infer<typeof Prescription>;
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
    return [subPlanKey ? '0' : '1', ...(subPlanKey ?? ['', ''])].join();
  };

  return prescriptions.toSorted((a, b) => sortKey(a).localeCompare(sortKey(b)));
};

const PrescriptionPermission = z.enum(['update']);

export type PrescriptionPermission = z.infer<typeof PrescriptionPermission>;

export const hasPrescriptionPermission = (
  userRole: UserRole,
  programmingPlan: ProgrammingPlanChecked
): Record<PrescriptionPermission, boolean> => ({
  update:
    hasPermission(userRole, 'updatePrescription') &&
    programmingPlan.regionalStatus.some(
      (regionalStatus) => regionalStatus.status !== 'Closed'
    )
});

export const getPrescriptionTitle = (
  referential: MatrixReferential,
  programmingPlans: Pick<ProgrammingPlanChecked, 'subPlans'>[],
  prescription: Pick<Prescription, 'programmingSubPlanId'>
): string =>
  getSubPlanMatrixLabels(
    referential,
    findPrescriptionSubPlan(programmingPlans, prescription)?.matrices ?? null
  ).join(', ');
