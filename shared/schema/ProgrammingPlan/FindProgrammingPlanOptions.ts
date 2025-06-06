import { z } from 'zod/v4';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';
export const FindProgrammingPlanOptions = z.object({
  kinds: z.array(ProgrammingPlanKind).nullish(),
  year: z.number().int().nullish(),
  status: coerceToArray(z.array(ProgrammingPlanStatus)).nullish(),
  region: Region.nullish()
});

export type FindProgrammingPlanOptions = z.infer<
  typeof FindProgrammingPlanOptions
>;
