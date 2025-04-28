import { z } from 'zod';
import { Region } from '../../referential/Region';
import { UserRole } from './UserRole';
import { coerceToArray } from '../../utils/utils';
export const FindUserOptions = z.object({
  region: Region.nullish(),
  roles: z
    .union([UserRole, coerceToArray(z.array(UserRole))])
    .nullish(),
});

export type FindUserOptions = z.infer<typeof FindUserOptions>;
