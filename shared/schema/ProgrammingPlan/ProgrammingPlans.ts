import { z } from 'zod';
import { ProgrammingPlanRegionalStatus } from './ProgrammingPlanRegionalStatus';

export const ProgrammingPlan = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  year: z.number(),
  regionalStatus: z.array(ProgrammingPlanRegionalStatus)
});

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
