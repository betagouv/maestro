import { intersection } from 'lodash-es';
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

export type User = z.infer<typeof User>;

export const userRegions = (user?: User) =>
  user ? (user.region ? [user.region] : RegionList) : [];

export const userDepartments = (user?: User) =>
  user
    ? userRegions(user).flatMap((region) => [
        ...Regions[region].departments,
        ...(Regions[region].borderingDepartments || [])
      ])
    : [];

export const hasPermission = (user: User, ...permissions: UserPermission[]) => {
  const userPermissions = user.roles
    .map((role) => UserRolePermissions[role])
    .flat();

  return intersection(permissions, userPermissions).length > 0;
};
