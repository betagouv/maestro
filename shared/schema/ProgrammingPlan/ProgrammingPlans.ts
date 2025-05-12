import { z } from 'zod';
import { Context } from './Context';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';
import { ProgrammingPlanRegionalStatus } from './ProgrammingPlanRegionalStatus';

export const ProgrammingPlan = z.object({
  id: z.string().uuid(),
  kinds: z.array(ProgrammingPlanKind),
  contexts: z.array(Context),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  year: z.number(),
  regionalStatus: z.array(ProgrammingPlanRegionalStatus)
});

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
