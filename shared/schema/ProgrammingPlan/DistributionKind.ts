import { z } from 'zod';
import {
  SlaughterhouseStage,
  stagesOfSelection
} from '../../referential/Stage';
import { isPPVSubPlan, type ProgrammingSubPlan } from './ProgrammingSubPlan';

export const DistributionKind = z.enum(
  ['REGIONAL', 'SLAUGHTERHOUSE', 'DEPARTMENTAL'],
  {
    error: () => 'Veuillez renseigner le mode de répartition.'
  }
);

export type DistributionKind = z.infer<typeof DistributionKind>;

type DistributionSubPlan = Pick<ProgrammingSubPlan, 'subPlanNumber' | 'stages'>;

export const planDistributionKind = (plan: {
  subPlans: DistributionSubPlan[];
}): DistributionKind => {
  if (plan.subPlans.some(isPPVSubPlan)) {
    return 'REGIONAL';
  }
  if (
    plan.subPlans.some((subPlan) =>
      stagesOfSelection(subPlan.stages).includes(SlaughterhouseStage)
    )
  ) {
    return 'SLAUGHTERHOUSE';
  }
  return 'DEPARTMENTAL';
};

export const subPlanDistributionKind = (
  subPlan: DistributionSubPlan
): DistributionKind => planDistributionKind({ subPlans: [subPlan] });
