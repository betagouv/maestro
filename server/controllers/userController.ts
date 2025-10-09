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
    get: async ({ user, query }) => {
      const findOptions = {
        ...query,
        region: user.region ?? query.region
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
