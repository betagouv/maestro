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
  canManageUser
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

      const managerSubPlanIds = account.programmingSubPlans.map(
        (subPlan) => subPlan.id
      );
      const programmingSubPlans =
        managerSubPlanIds.length === 0
          ? body.programmingSubPlans
          : [
              ...body.programmingSubPlans.filter((subPlan) =>
                managerSubPlanIds.includes(subPlan.id)
              ),
              ...userToUpdate.programmingSubPlans.filter(
                (subPlan) => !managerSubPlanIds.includes(subPlan.id)
              )
            ];

      const updatedUser = { ...body, programmingSubPlans };

      if (!canManageUser(account, { ...updatedUser, id: userId })) {
        return { status: HttpStatus.FORBIDDEN };
      }

      await userService.update(updatedUser, userId);
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
    post: async ({ body, account }) => {
      console.info('Create user', body);

      if (!canCreateUser(account, body)) {
        return { status: HttpStatus.FORBIDDEN };
      }

      await userService.insert({ ...body, name: null });
      return { status: HttpStatus.CREATED };
    }
  }
} as const satisfies ProtectedSubRouter;
