import { intersection, uniq } from 'lodash-es';
import type { Stage } from '../../referential/Stage';
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
  AdministratorMaestro: UserRoleList,
  AdministratorBGIR: UserRoleList.filter(
    (role) => role !== 'AdministratorMaestro'
  ),
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
  'id' | 'roles' | 'region' | 'department' | 'stages'
>;

export type ManagedUser = Pick<
  UserBase,
  'roles' | 'region' | 'department' | 'stages'
>;

type UserManagementScope = 'national' | 'regional' | 'departmental' | 'none';

// Le périmètre le plus large de mes rôles l'emporte.
export const managementScope = (
  manager: Pick<UserManager, 'roles'>
): UserManagementScope =>
  manager.roles.some(
    (role) => role === 'AdministratorMaestro' || role === 'AdministratorBGIR'
  )
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

type StageManager = Pick<UserManager, 'roles' | 'stages'>;

// Les stades sur lesquels le gestionnaire a la main. `null` = portée nationale, donc
// aucune contrainte de stade.
export const managerStages = (manager: StageManager): Stage[] | null =>
  managementScope(manager) === 'national' ? null : manager.stages;

// Un gestionnaire n'attribue que ses propres stades : les stades de la cible qui sortent
// de son périmètre sont conservés tels quels.
export const mergeManagedStages = (
  manager: StageManager,
  submittedStages: Stage[],
  currentStages: Stage[] = []
): Stage[] => {
  const managedStages = managerStages(manager);

  if (managedStages === null) {
    return submittedStages;
  }

  return uniq([
    ...submittedStages.filter((stage) => managedStages.includes(stage)),
    ...currentStages.filter((stage) => !managedStages.includes(stage))
  ]);
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

  const managedStages = managerStages(manager);
  if (managedStages !== null) {
    if (intersection(managedStages, target.stages).length === 0) {
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
