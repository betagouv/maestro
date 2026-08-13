import { intersection, uniq } from 'lodash-es';
import type {
  ProgrammingSubPlan,
  ProgrammingSubPlanId
} from '../ProgrammingPlan/ProgrammingSubPlan';
import type { UserBase } from './User';
import {
  type UserRole,
  UserRoleList,
  type UserRoleWithPermission
} from './UserRole';

type ManagerUserRole = UserRoleWithPermission<'manageUsers'>;

// Qui peut créer, modifier et désactiver qui ?
// clé = gestionnaire, valeur = rôles gérés.
export const ManageableUserRoles: Record<ManagerUserRole, UserRole[]> &
  Record<Exclude<UserRole, ManagerUserRole>, []> = {
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

type UserManager = Pick<
  UserBase,
  'id' | 'roles' | 'region' | 'department' | 'programmingSubPlans'
>;

export type ManagedUser = Pick<
  UserBase,
  'roles' | 'region' | 'department' | 'programmingSubPlans'
>;

type UserManagementScope = 'national' | 'regional' | 'departmental' | 'none';

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

type SubPlanManager = Pick<UserManager, 'roles' | 'programmingSubPlans'>;

// Les sous-plans sur lesquels le gestionnaire a la main. `null` = portée nationale, donc
// aucune contrainte de sous-plan.
export const managerSubPlanIds = (
  manager: SubPlanManager
): ProgrammingSubPlanId[] | null =>
  managementScope(manager) === 'national'
    ? null
    : manager.programmingSubPlans.map((subPlan) => subPlan.id);

// Un gestionnaire n'attribue que ses propres sous-plans : les sous-plans de la cible qui
// sortent de son périmètre sont conservés tels quels.
export const mergeManagedSubPlans = (
  manager: SubPlanManager,
  submittedSubPlans: ProgrammingSubPlan[],
  currentSubPlans: ProgrammingSubPlan[] = []
): ProgrammingSubPlan[] => {
  const managedIds = managerSubPlanIds(manager);

  if (managedIds === null) {
    return submittedSubPlans;
  }

  return [
    ...submittedSubPlans.filter((subPlan) => managedIds.includes(subPlan.id)),
    ...currentSubPlans.filter((subPlan) => !managedIds.includes(subPlan.id))
  ];
};

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

  const managedIds = managerSubPlanIds(manager);
  if (managedIds !== null) {
    const sharedSubPlans = intersection(
      managedIds,
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
