import { z } from 'zod';
import {
  NextProgrammingPlanStatus,
  ProgrammingPlanStatus
} from './ProgrammingPlanStatus';

export const ProgrammingPlan = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  status: ProgrammingPlanStatus,
  statusDrom: ProgrammingPlanStatus,
  year: z.number()
});

export const ProgrammingPlanStatusUpdate = z.object({
  status: ProgrammingPlanStatus,
  isDrom: z.boolean()
});

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
export type ProgrammingPlanStatusUpdate = z.infer<
  typeof ProgrammingPlanStatusUpdate
>;

export const getNextProgrammingPlanStatus = (
  programmingPlan: ProgrammingPlan,
  isDrom: boolean
): ProgrammingPlanStatus | null =>
  isDrom
    ? NextProgrammingPlanStatus[programmingPlan.statusDrom]
    : NextProgrammingPlanStatus[programmingPlan.status];
