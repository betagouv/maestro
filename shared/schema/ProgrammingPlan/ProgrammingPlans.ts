import { z } from 'zod';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';

export const ProgrammingPlan = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  status: ProgrammingPlanStatus,
  year: z.number(),
});

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
