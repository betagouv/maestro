import { intersection } from 'lodash-es';
import type { Department } from 'maestro-shared/referential/Department';
import {
  companiesIsRequired,
  departmentIsRequired,
  programmingSubPlanIdsIsRequired,
  UserRefined,
  userRegionsForRole
} from 'maestro-shared/schema/User/User';
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
    put: async ({ body }, { userId }) => {
      console.info('Update user', body);

      const userToUpdate = await userRepository.findUnique(userId);
      if (!userToUpdate) {
        return { status: HttpStatus.NOT_FOUND };
      }

      await userService.update(body, userId);
      return { status: HttpStatus.OK };
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
    post: async ({ body }) => {
      console.info('Create user', body);

      await userService.insert({ ...body, name: null });
      return { status: HttpStatus.CREATED };
    }
  }
} as const satisfies ProtectedSubRouter;
