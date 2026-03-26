import { constants } from 'node:http2';
import { intersection } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import {
  companiesIsRequired,
  departmentIsRequired,
  programmingPlanKindsIsRequired,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
import { isNationalRole } from 'maestro-shared/schema/User/UserRole';
import { userRepository } from '../repositories/userRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const usersRouter = {
  '/users/:userId': {
    get: async ({ user: authUser, userRole }, { userId }) => {
      console.info('Get user', userId);

      const user = await userRepository.findUnique(userId);

      if (!user) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      if (
        intersection(
          userRegionsForRole(user, userRole),
          userRegionsForRole(authUser, userRole)
        ).length === 0
      ) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      return { status: constants.HTTP_STATUS_OK, response: user };
    },
    put: async ({ body }, { userId }) => {
      console.info('Update user', body);

      const userToUpdate = await userRepository.findUnique(userId);
      if (!userToUpdate) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      await userRepository.update(body, userId);
      return { status: constants.HTTP_STATUS_OK };
    }
  },
  '/users': {
    get: async ({ user, userRole, query }) => {
      const companySirets = companiesIsRequired({
        ...user,
        roles: [userRole]
      })
        ? user.companies.map((company) => company.siret)
        : query.companySirets;

      const findOptions = {
        ...query,
        region: isNationalRole(userRole) ? query.region : user.region,
        department: departmentIsRequired({
          ...user,
          roles: [userRole]
        })
          ? (user.department as Department)
          : query.department,
        companySirets,
        programmingPlanKinds: programmingPlanKindsIsRequired({
          ...user,
          roles: [userRole]
        })
          ? user.programmingPlanKinds
          : query.programmingPlanKinds
      };

      console.info('Find users', findOptions);

      const users = await userRepository.findMany(findOptions);

      return { status: constants.HTTP_STATUS_OK, response: users };
    },
    post: async ({ body }) => {
      console.info('Create user', body);

      await userRepository.insert(body);
      return { status: constants.HTTP_STATUS_CREATED };
    }
  }
} as const satisfies ProtectedSubRouter;
