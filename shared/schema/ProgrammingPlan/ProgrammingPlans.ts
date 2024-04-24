import { z } from 'zod';
import { Region } from '../Region';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';

export const ProgrammingPlan = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.coerce.date(),
  createdBy: z.string(),
  kind: ProgrammingPlanKind,
});

export const RegionalProgrammingPlanDB = z.object({
  programmingPlanId: z.string().uuid(),
  region: Region,
  laboratoryId: z.string().uuid().optional().nullable(),
  status: ProgrammingPlanStatus,
});

export const RegionalProgrammingPlan = ProgrammingPlan.merge(
  RegionalProgrammingPlanDB.omit({ programmingPlanId: true })
);

export type ProgrammingPlan = z.infer<typeof ProgrammingPlan>;
export type RegionalProgrammingPlanDB = z.infer<
  typeof RegionalProgrammingPlanDB
>;
export type RegionalProgrammingPlan = z.infer<typeof RegionalProgrammingPlan>;
