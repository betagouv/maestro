import { intersection, isNil } from 'lodash-es';
import { z } from 'zod';
import { Region, RegionList } from '../../referential/Region';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { UserPermission } from './UserPermission';
import {
  NationalUserRole,
  RegionalAndNationUserRole,
  RegionalUserRole,
  UserRole,
  UserRolePermissions
} from './UserRole';

const BaseUser = z.object({
  id: z.guid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  programmingPlanKinds: z.array(ProgrammingPlanKind),
  role: UserRole,
  region: Region.nullish()
});

export const User = BaseUser.superRefine((user, ctx) => {
  if (
    !user.region &&
    (RegionalUserRole.safeParse(user.role).success ||
      RegionalAndNationUserRole.safeParse(user.role).success)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'La région est obligatoire pour ce rôle'
    });
  }
});

export const Sampler = BaseUser.pick({
  id: true,
  firstName: true,
  lastName: true
});

export type User = z.infer<typeof User>;
export type Sampler = z.infer<typeof Sampler>;

export const userRegions = (user?: User): Region[] =>
  user
    ? hasNationalRole(user)
      ? RegionList
      : !isNil(user.region)
        ? [user.region]
        : []
    : [];

export const hasPermission = (user: User, ...permissions: UserPermission[]) =>
  intersection(permissions, UserRolePermissions[user.role]).length > 0;

export const hasNationalRole = (user: Pick<User, 'role'>) =>
  NationalUserRole.safeParse(user.role).success ||
  RegionalAndNationUserRole.safeParse(user.role).success;
