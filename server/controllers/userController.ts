import { intersection } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import {
  companiesIsRequired,
  departmentIsRequired,
  programmingSubPlanIdsIsRequired,
  UserRefined,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import {
  canCreateUser,
  canManageUser,
  canManageUsers,
  managementScope,
  managerSubPlanIds,
  mergeManagedSubPlans
} from 'maestro-shared/schema/User/UserManagement';
import { isNationalRole } from 'maestro-shared/schema/User/UserRole';
import { HttpStatus } from '../constants/httpStatus';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { userService } from '../services/userService';

export const usersRouter = {
  '/users/:userId': {
    get: async ({ user: authUser, userRole }, { userId }) => {
      console.info('Get user', userId);

      const user = await userRepository.findUnique(userId);

      if (!user) {
        return { status: HttpStatus.NOT_FOUND };
      }

      if (
        intersection(
          userRegionsForRole(user, userRole),
          userRegionsForRole(authUser, userRole)
        ).length === 0
      ) {
        return { status: HttpStatus.FORBIDDEN };
      }

      return { status: HttpStatus.OK, response: UserRefined.parse(user) };
    },
    put: async ({ body, account }, { userId }) => {
      console.info('Update user', body);

      const userToUpdate = await userRepository.findUnique(userId);
      if (!userToUpdate) {
        return { status: HttpStatus.NOT_FOUND };
      }

      if (!canManageUser(account, userToUpdate)) {
        return { status: HttpStatus.FORBIDDEN };
      }

      const updatedUser = {
        ...body,
        programmingSubPlans: mergeManagedSubPlans(
          account,
          body.programmingSubPlans,
          userToUpdate.programmingSubPlans
        )
      };

      if (!canManageUser(account, { ...updatedUser, id: userId })) {
        return { status: HttpStatus.FORBIDDEN };
      }

      await userService.update(updatedUser, userId);
      return { status: HttpStatus.OK };
    }
  },
  '/users': {
    get: async ({ user, userRole, account, query }) => {
      // TODO à revoir, cette route est utilisées par plusieurs écrans (utilisateurs, filtre et prélèvement)
      // dans utilisateurs on ne prend pas en compte le role actif, alors que dans les autres oui, il faudrait revoir tout ça...
      const scope = managementScope(account);
      const findOptions = canManageUsers(account)
        ? {
            ...query,
            region: scope === 'national' ? query.region : account.region,
            department:
              scope === 'departmental'
                ? (account.department as Department)
                : query.department,
            programmingSubPlanIds:
              managerSubPlanIds(account) ?? query.programmingSubPlanIds
          }
        : {
            ...query,
            region: isNationalRole(userRole) ? query.region : user.region,
            department: departmentIsRequired({
              ...user,
              roles: [userRole]
            })
              ? (user.department as Department)
              : query.department,
            companySirets: companiesIsRequired({
              ...user,
              roles: [userRole]
            })
              ? user.companies.map((company) => company.siret)
              : query.companySirets,
            programmingSubPlanIds: programmingSubPlanIdsIsRequired({
              ...user,
              roles: [userRole]
            })
              ? user.programmingSubPlans.map((sp) => sp.id)
              : query.programmingSubPlanIds
          };

      console.info('Find users', findOptions);

      const users = await userRepository.findMany(findOptions);

      return { status: HttpStatus.OK, response: users };
    },
    post: async ({ body, account }) => {
      console.info('Create user', body);

      if (!canCreateUser(account, body)) {
        return { status: HttpStatus.FORBIDDEN };
      }

      await userService.insert({
        ...body,
        programmingSubPlans: mergeManagedSubPlans(
          account,
          body.programmingSubPlans
        ),
        name: null
      });
      return { status: HttpStatus.CREATED };
    }
  }
} as const satisfies ProtectedSubRouter;
