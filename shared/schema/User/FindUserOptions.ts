import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { UserRole } from './UserRole';
export const FindUserOptions = z.object({
  region: Region.nullish(),
  department: Department.nullish(),
  roles: z.array(UserRole).nullish(),
  programmingPlanKinds: z
    .union([ProgrammingPlanKind, z.array(ProgrammingPlanKind)])
    .nullish(),
  companySirets: z.array(z.string()).nullish(),
  disabled: z.boolean().nullish(),
  laboratoryIds: z.array(z.string()).nullish()
});

export type FindUserOptions = z.infer<typeof FindUserOptions>;
