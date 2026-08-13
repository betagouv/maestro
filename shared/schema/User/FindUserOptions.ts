import { z } from 'zod';
import { Department } from '../../referential/Department';
import { Region } from '../../referential/Region';
import { Stage } from '../../referential/Stage';
import { UserRole } from './UserRole';

export const FindUserOptions = z.object({
  region: Region.nullish(),
  department: Department.nullish(),
  roles: z.array(UserRole).nullish(),
  stages: z.union([Stage, z.array(Stage)]).nullish(),
  companySirets: z.array(z.string()).nullish(),
  disabled: z.boolean().nullish(),
  laboratoryIds: z.array(z.string()).nullish()
});

export type FindUserOptions = z.infer<typeof FindUserOptions>;
