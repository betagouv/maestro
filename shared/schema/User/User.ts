import { z } from 'zod';
import { Region, RegionList } from '../Region';
import { UserRole } from './UserRole';

export const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password: z.string(),
  roles: z.array(UserRole),
  region: Region.optional().nullable(),
});

export const UserInfos = User.pick({
  email: true,
  roles: true,
  region: true,
});

export type User = z.infer<typeof User>;
export type UserInfos = z.infer<typeof UserInfos>;

export const userRegions = (user: User) =>
  user.region ? [user.region] : RegionList;
