import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { UserRole } from './UserRole';
export const FindUserOptions = z.object({
  region: Region.nullish(),
  department: Department.nullish(),
  roles: z.union([UserRole, coerceToArray(z.array(UserRole))]).nullish(),
  programmingPlanKinds: z
    .union([ProgrammingPlanKind, coerceToArray(z.array(ProgrammingPlanKind))])
    .nullish()
});

export type FindUserOptions = z.infer<typeof FindUserOptions>;
