import { intersection } from 'lodash-es';
import { z } from 'zod';
import { Region, RegionList } from '../../referential/Region';
import { UserPermission } from './UserPermission';
import {
  NationalUserRole,
  RegionalUserRole,
  UserRole,
  UserRolePermissions
} from './UserRole';

export const BaseUser = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: UserRole,
  region: Region.nullable()
});

export const User = BaseUser.superRefine((user, ctx) => {
  if (RegionalUserRole.safeParse(user.role).success && !user.region) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La région est obligatoire pour ce rôle'
    });
  }
});

export type BaseUser = z.infer<typeof BaseUser>;
export type User = z.infer<typeof User>;

export const userRegions = (user?: User) =>
  user ? (hasNationalRole(user) ? RegionList : [user.region]) : [];

export const hasPermission = (user: User, ...permissions: UserPermission[]) =>
  intersection(permissions, UserRolePermissions[user.role]).length > 0;

export const hasNationalRole = (user: Pick<User, 'role'>) =>
  NationalUserRole.safeParse(user.role).success;
