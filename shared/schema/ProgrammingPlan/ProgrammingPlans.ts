import { z } from 'zod';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';

export const ProgrammingPlan = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  kind: ProgrammingPlanKind,
  status: ProgrammingPlanStatus,
});

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
