import { intersection } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import {
  companiesIsRequired,
  departmentIsRequired,
  stagesIsRequired,
  UserRefined,
  UserToUpdateRefined,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import {
  canCreateUser,
  canManageUser,
  canManageUsers,
  managementScope,
  managerStages,
  mergeManagedStages
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

      const mergedUser = {
        ...body,
        stages: mergeManagedStages(account, body.stages, userToUpdate.stages)
      };

      if (!canManageUser(account, { ...mergedUser, id: userId })) {
        return { status: HttpStatus.FORBIDDEN };
      }

      if (!UserToUpdateRefined.safeParse(mergedUser).success) {
        return { status: HttpStatus.BAD_REQUEST };
      }

      await userService.update(mergedUser, userId);
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
            stages: managerStages(account) ?? query.stages
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
            stages: stagesIsRequired({
              ...user,
              roles: [userRole]
            })
              ? user.stages
              : query.stages
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

      const userToCreate = {
        ...body,
        stages: mergeManagedStages(account, body.stages),
        name: null
      };

      await userService.insert(userToCreate);
      return { status: HttpStatus.CREATED };
    }
  }
} as const satisfies ProtectedSubRouter;
