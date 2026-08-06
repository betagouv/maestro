import { intersection, uniq } from 'lodash-es';
import type { UserBase } from './User';
import { type UserRole, UserRoleList } from './UserRole';

// Qui peut créer, modifier et désactiver qui ?
// clé = gestionnaire, valeur = rôles gérés.
export const ManageableUserRoles: Record<UserRole, UserRole[]> = {
  Administrator: UserRoleList,
  RegionalCoordinator: [
    'RegionalCoordinator',
    'RegionalObserver',
    'DepartmentalCoordinator',
    'DepartmentalObserver',
    'Sampler'
  ],
  DepartmentalCoordinator: [
    'DepartmentalCoordinator',
    'DepartmentalObserver',
    'Sampler'
  ],
  NationalCoordinator: [],
  NationalObserver: [],
  RegionalObserver: [],
  DepartmentalObserver: [],
  Sampler: [],
  LaboratoryUser: [],
  LaboratoryOffice: []
};

export type UserManager = Pick<
  UserBase,
  'id' | 'roles' | 'region' | 'department' | 'programmingSubPlans'
>;

export type ManagedUser = Pick<
  UserBase,
  'roles' | 'region' | 'department' | 'programmingSubPlans'
>;

export type UserManagementScope =
  | 'national'
  | 'regional'
  | 'departmental'
  | 'none';

// Le périmètre le plus large de mes rôles l'emporte.
export const managementScope = (
  manager: Pick<UserManager, 'roles'>
): UserManagementScope =>
  manager.roles.includes('Administrator')
    ? 'national'
    : manager.roles.includes('RegionalCoordinator')
      ? 'regional'
      : manager.roles.includes('DepartmentalCoordinator')
        ? 'departmental'
        : 'none';

export const manageableUserRoles = (
  manager: Pick<UserManager, 'roles'>
): UserRole[] =>
  uniq(manager.roles.flatMap((role) => ManageableUserRoles[role]));

export const canManageUsers = (manager: Pick<UserManager, 'roles'>): boolean =>
  manageableUserRoles(manager).length > 0;

const isWithinScope = (manager: UserManager, target: ManagedUser): boolean => {
  const manageableRoles = manageableUserRoles(manager);
  if (!target.roles.every((role) => manageableRoles.includes(role))) {
    return false;
  }

  const scope = managementScope(manager);
  if (scope === 'none') {
    return false;
  }

  if (scope !== 'national') {
    if (!manager.region || target.region !== manager.region) {
      return false;
    }
    if (
      scope === 'departmental' &&
      (!manager.department || target.department !== manager.department)
    ) {
      return false;
    }
  }

  // Un gestionnaire sans sous-plan (cas Administrator) n'est pas contraint sur les plans.
  if (manager.programmingSubPlans.length > 0) {
    const sharedSubPlans = intersection(
      manager.programmingSubPlans.map((subPlan) => subPlan.id),
      target.programmingSubPlans.map((subPlan) => subPlan.id)
    );
    if (sharedSubPlans.length === 0) {
      return false;
    }
  }

  return true;
};

export const canCreateUser = (
  manager: UserManager,
  userToCreate: ManagedUser
): boolean => isWithinScope(manager, userToCreate);

export const canManageUser = (
  manager: UserManager,
  target: ManagedUser & Pick<UserBase, 'id'>
): boolean => manager.id !== target.id && isWithinScope(manager, target);
