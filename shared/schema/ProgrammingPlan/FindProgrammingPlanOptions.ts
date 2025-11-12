import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanKind } from './ProgrammingPlanKind';
import { ProgrammingPlanStatus } from './ProgrammingPlanStatus';
export const FindProgrammingPlanOptions = z.object({
  kinds: z.array(ProgrammingPlanKind).nullish(),
  year: z.coerce.number().int().nullish(),
  status: coerceToArray(z.array(ProgrammingPlanStatus)).nullish(),
  region: Region.nullish(),
  department: Department.nullish()
});

export type FindProgrammingPlanOptions = z.infer<
  typeof FindProgrammingPlanOptions
>;
