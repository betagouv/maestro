import { intersection, isNil } from 'lodash-es';
import { RefinementCtx, z } from 'zod';
import { Region, RegionList } from '../../referential/Region';
import { Nullable } from '../../utils/typescript';
import { ProgrammingPlanKind } from '../ProgrammingPlan/ProgrammingPlanKind';
import { UserPermission } from './UserPermission';
import {
  NationalUserRole,
  RegionalAndNationUserRole,
  UserRole,
  UserRolePermissions
} from './UserRole';

const BaseUser = z.object({
  id: z.guid(),
  email: z.email({ error: 'Veuillez renseigner un email valide.' }),
  name: z.string(),
  programmingPlanKinds: z.array(ProgrammingPlanKind),
  role: UserRole,
  region: Region.nullable()
});

const regionCheck = <T extends Pick<User, 'region' | 'role'>>(
  user: T,
  ctx: RefinementCtx<T>
) => {
  if (!user.region && !hasNationalRole(user)) {
    ctx.addIssue({
      key: 'region',
      path: ['region'],
      code: 'custom',
      message: 'La région est obligatoire pour ce rôle.'
    });
  }
};

export const User = BaseUser.superRefine(regionCheck);

export const UserToCreate = User.omit({ id: true, name: true }).superRefine(
  regionCheck
);
export type UserToCreate = z.infer<typeof UserToCreate>;

export const UserToUpdate = User.omit({ name: true }).superRefine(regionCheck);
export type UserToUpdate = z.infer<typeof UserToUpdate>;

export const Sampler = BaseUser.pick({
  id: true,
  name: true
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

export const hasNationalRole = (user: Nullable<Pick<User, 'role'>>) =>
  NationalUserRole.safeParse(user.role).success ||
  RegionalAndNationUserRole.safeParse(user.role).success;
