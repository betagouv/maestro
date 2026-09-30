import type { Prescription } from 'maestro-shared/schema/Prescription/Prescription';
import type { ProgrammingPlanChecked } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';

export const findPrescriptionPlan = <
  T extends Pick<ProgrammingPlanChecked, 'subPlans'>
>(
  programmingPlans: T[],
  prescription: Pick<Prescription, 'programmingSubPlanId'>
): T | undefined =>
  programmingPlans.find((programmingPlan) =>
    programmingPlan.subPlans.some(
      (subPlan) => subPlan.id === prescription.programmingSubPlanId
    )
  );
