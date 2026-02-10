import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { coerceToArray, coerceToBooleanNullish } from '../../utils/utils';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { UserRole } from './UserRole';
export const FindUserOptions = z.object({
  region: Region.nullish(),
  department: Department.nullish(),
  roles: coerceToArray(z.array(UserRole)).nullish(),
  programmingPlanKinds: z
    .union([ProgrammingPlanKind, coerceToArray(z.array(ProgrammingPlanKind))])
    .nullish(),
  companySirets: coerceToArray(z.array(z.string())).nullish(),
  disabled: coerceToBooleanNullish()
});

export type FindUserOptions = z.infer<typeof FindUserOptions>;
