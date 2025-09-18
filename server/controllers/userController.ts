import { constants } from 'http2';
import { intersection } from 'lodash-es';
import { userRegions } from 'maestro-shared/schema/User/User';
import { userRepository } from '../repositories/userRepository';
import { ProtectedSubRouter } from '../routers/routes.type';

export const usersRouter = {
  '/users/:userId': {
    get: async ({ user: authUser }, { userId }) => {
      console.info('Get user', userId);

      const user = await userRepository.findUnique(userId);

      if (!user) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      if (intersection(userRegions(user), userRegions(authUser)).length === 0) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      return { status: constants.HTTP_STATUS_OK, response: user };
    }
  },
  '/users': {
    get: async ({ user, query }) => {
      const findOptions = {
        ...query,
        region: user.region ?? query.region
      };

      console.info('Find users', findOptions);

      const users = await userRepository.findMany(findOptions);

      return { status: constants.HTTP_STATUS_OK, response: users };
    }
  }
} as const satisfies ProtectedSubRouter;
