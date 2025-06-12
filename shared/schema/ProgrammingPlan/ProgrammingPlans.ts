import { z } from 'zod/v4';
import { ProgrammingPlanContext } from './Context';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';
import { ProgrammingPlanRegionalStatus } from './ProgrammingPlanRegionalStatus';

export const ProgrammingPlan = z.object({
  id: z.guid(),
  kinds: z.array(ProgrammingPlanKind),
  contexts: z.array(ProgrammingPlanContext),
  createdAt: z.coerce.date(),
  createdBy: z.guid(),
  year: z.number(),
  regionalStatus: z.array(ProgrammingPlanRegionalStatus),
  closedAt: z.coerce.date().nullish(),
  closedBy: z.guid().nullish()
});

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
