import { z } from 'zod';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';

export const ProgrammingPlan = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  kind: ProgrammingPlanKind,
});

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
