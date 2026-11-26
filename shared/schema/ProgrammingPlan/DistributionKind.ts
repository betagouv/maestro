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
export const subPlanDistributionKind = (
  subPlan: Pick<ProgrammingSubPlan, 'subPlanNumber' | 'stages'>
): DistributionKind => subPlansDistributionKind([subPlan]);

export const subPlansDistributionKind = (
  subPlans: Pick<ProgrammingSubPlan, 'subPlanNumber' | 'stages'>[]
): DistributionKind => {
  if (subPlans.some(isPPVSubPlan)) {
    return 'REGIONAL';
  }
  if (
    subPlans.some((subPlan) =>
      stagesOfSelection(subPlan.stages).includes(SlaughterhouseStage)
    )
  ) {
    return 'SLAUGHTERHOUSE';
  }
  return 'DEPARTMENTAL';
};
