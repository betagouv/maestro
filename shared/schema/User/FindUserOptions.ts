import { z } from 'zod';
import { Region } from '../../referential/Region';
import { UserRole } from './UserRole';
export const FindUserOptions = z.object({
  region: Region.nullish(),
  role: UserRole.nullish()
});

export type FindUserOptions = z.infer<typeof FindUserOptions>;
