import _ from 'lodash';
import { z } from 'zod';
import { Region, RegionList, Regions } from '../../referential/Region';
import { UserPermission } from './UserPermission';
import { UserRole, UserRolePermissions } from './UserRole';

export const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(UserRole),
  region: Region.nullable()
});

export const UserInfos = User.pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  roles: true,
  region: true
});

export type User = z.infer<typeof User>;
export type UserInfos = z.infer<typeof UserInfos>;

export const userRegions = (user?: User | UserInfos) =>
  user ? (user.region ? [user.region] : RegionList) : [];

export const userDepartments = (user?: User | UserInfos) =>
  user
    ? userRegions(user).flatMap((region) => [
        ...Regions[region].departments,
        ...(Regions[region].borderingDepartments || [])
      ])
    : [];

export const hasPermission = (
  user: User | UserInfos,
  ...permissions: UserPermission[]
) => {
  const userPermissions = user.roles
    .map((role) => UserRolePermissions[role])
    .flat();

  return _.intersection(permissions, userPermissions).length > 0;
};
