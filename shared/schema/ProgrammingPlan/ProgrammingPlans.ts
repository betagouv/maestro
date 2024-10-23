import { z } from 'zod';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusLabels,
} from './ProgrammingPlanStatus';

export const ProgrammingPlan = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  status: ProgrammingPlanStatus,
  year: z.number(),
});

export const ProgrammingPlanUpdate = ProgrammingPlan.pick({
  status: true,
});

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
export type ProgrammingPlanUpdate = z.infer<typeof ProgrammingPlanUpdate>;

export const programmingPlanLabel = (programmingPlan: ProgrammingPlan) =>
  `${ProgrammingPlanStatusLabels[programmingPlan.status]} ${
    programmingPlan.year
  }`;
