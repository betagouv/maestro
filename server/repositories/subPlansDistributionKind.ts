import { SlaughterhouseStage } from 'maestro-shared/referential/Stage';
import type { DistributionKind } from 'maestro-shared/schema/ProgrammingPlan/DistributionKind';
import {
  isPPVSubPlan,
  type ProgrammingSubPlan
} from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';

export const subPlansDistributionKind = (
  subPlans: Pick<ProgrammingSubPlan, 'subPlanNumber' | 'stages'>[]
): DistributionKind => {
  if (subPlans.some(isPPVSubPlan)) {
    return 'REGIONAL';
  }
  if (
    subPlans.some((subPlan) => subPlan.stages?.includes(SlaughterhouseStage))
  ) {
    return 'SLAUGHTERHOUSE';
  }
  return 'DEPARTMENTAL';
};
