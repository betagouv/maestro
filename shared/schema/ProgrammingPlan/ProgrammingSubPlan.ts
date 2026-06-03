import { z } from 'zod';
import { Stage } from '../../referential/Stage';

export const ProgrammingSubPlanId = z.string().brand<'ProgrammingSubPlanId'>();
export type ProgrammingSubPlanId = z.infer<typeof ProgrammingSubPlanId>;

export const ProgrammingSubPlan = z.object({
  id: ProgrammingSubPlanId,
  programmingPlanId: z.guid(),
  codeNat: z.string(),
  stages: z.array(Stage),
  label: z.string(),
  analysisPermissionRole: z.string().nullish(),
  contactListId: z.number().int().nullish(),
  withSacha: z.boolean()
});

export type ProgrammingSubPlan = z.infer<typeof ProgrammingSubPlan>;
