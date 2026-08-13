import { intersection, uniq } from 'lodash-es';
import { z } from 'zod';
import { Stage } from '../../referential/Stage';
import { SubstanceKind } from '../Substance/SubstanceKind';
import { UserRole } from '../User/UserRole';

export const ProgrammingSubPlanId = z.string().brand<'ProgrammingSubPlanId'>();
export type ProgrammingSubPlanId = z.infer<typeof ProgrammingSubPlanId>;

export const ProgrammingSubPlan = z.object({
  id: ProgrammingSubPlanId,
  programmingPlanId: z.guid(),
  subPlanNumber: z.string(),
  stages: z.array(Stage),
  label: z.string(),
  analysisPermissionRole: UserRole.nullish(),
  contactListId: z.number().int().nullish(),
  withSacha: z.boolean(),
  substanceKinds: z.array(SubstanceKind)
});

export type ProgrammingSubPlan = z.infer<typeof ProgrammingSubPlan>;

export const subPlansForStages = <T extends Pick<ProgrammingSubPlan, 'stages'>>(
  subPlans: T[],
  stages: Stage[]
): T[] =>
  subPlans.filter((subPlan) => intersection(subPlan.stages, stages).length > 0);

export const stagesFromSubPlans = (
  subPlans: Pick<ProgrammingSubPlan, 'stages'>[]
): Stage[] => uniq(subPlans.flatMap((subPlan) => subPlan.stages));
