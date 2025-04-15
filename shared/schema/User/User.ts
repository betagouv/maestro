import { intersection } from 'lodash-es';
import { z } from 'zod';
import { Region, RegionList } from '../../referential/Region';
import { UserPermission } from './UserPermission';
import {
  NationalUserRole,
  RegionalUserRole,
  UserRolePermissions
} from './UserRole';

export const BaseUser = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string()
});

export const NationalUser = z.object({
  ...BaseUser.shape,
  role: NationalUserRole,
  region: Region.nullish()
});

export const RegionalUser = z.object({
  ...BaseUser.shape,
  role: RegionalUserRole,
  region: Region
});

export const User = z.discriminatedUnion('role', [NationalUser, RegionalUser]);

export type BaseUser = z.infer<typeof BaseUser>;
export type User = z.infer<typeof User>;

export const userRegions = (user?: User) =>
  user ? (hasNationalRole(user) ? RegionList : [user.region]) : [];

export const hasPermission = (user: User, ...permissions: UserPermission[]) =>
  intersection(permissions, UserRolePermissions[user.role]).length > 0;

export const hasNationalRole = (user: Pick<User, 'role'>) =>
  [
    'Admin',
    'NationalCoordinator',
    'NationalObserver',
    'SamplerAndNationalObserver'
  ].includes(user.role);
