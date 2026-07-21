import { z } from 'zod';
import { Stage } from '../../referential/Stage';
import { SubstanceKind } from '../Substance/SubstanceKind';
import { UserRole } from '../User/UserRole';
import {
  ProgrammingPlanDepartmentalStatus,
  ProgrammingPlanRegionalStatus
} from './ProgrammingPlanLocalStatus';

export const ProgrammingSubPlanId = z.string().brand<'ProgrammingSubPlanId'>();
export type ProgrammingSubPlanId = z.infer<typeof ProgrammingSubPlanId>;

export const ProgrammingSubPlanBase = z.object({
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

export type ProgrammingSubPlanBase = z.infer<typeof ProgrammingSubPlanBase>;

export const ProgrammingSubPlan = ProgrammingSubPlanBase.extend({
  regionalStatus: z.array(ProgrammingPlanRegionalStatus),
  departmentalStatus: z.array(ProgrammingPlanDepartmentalStatus)
});

export type ProgrammingSubPlan = z.infer<typeof ProgrammingSubPlan>;
