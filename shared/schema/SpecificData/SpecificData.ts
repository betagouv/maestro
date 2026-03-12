import { z } from 'zod';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';

export const UnknownValue = 'Unknown';
export const UnknownValueLabel = 'Je ne sais pas';

export const SpecificData = z
  .object({ programmingPlanKind: ProgrammingPlanKind })
  .passthrough();

export type SpecificData = z.infer<typeof SpecificData>;
