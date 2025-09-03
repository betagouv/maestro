import { z } from 'zod';
import { Region } from '../../referential/Region';
import { coerceToArray } from '../../utils/utils';
import { UserRole } from './UserRole';
export const FindUserOptions = z.object({
  region: Region.nullish(),
  roles: z.union([UserRole, coerceToArray(z.array(UserRole))]).nullish()
});

export type FindUserOptions = z.infer<typeof FindUserOptions>;
