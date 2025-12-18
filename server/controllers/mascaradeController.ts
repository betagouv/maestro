import { constants } from 'http2';
import {
  COOKIE_MAESTRO_MASCARADE,
  COOKIE_MAESTRO_USER_ROLE
} from 'maestro-shared/constants';
import { userRepository } from '../repositories/userRepository';
import { ProtectedSubRouter } from '../routers/routes.type';
import config from '../utils/config';

export const mascaradeRouter = {
  '/mascarade': {
    post: async (req, _param, { clearCookie }) => {
      clearCookie(COOKIE_MAESTRO_MASCARADE);
      clearCookie(COOKIE_MAESTRO_USER_ROLE);

      return {
        status: constants.HTTP_STATUS_OK,
        response: { userId: req.auth.userId }
      };
    }
  },
  '/mascarade/:userId': {
    post: async (_req, { userId }, { cookie }) => {
      const mascaradeUser = await userRepository.findUnique(userId);
      if (mascaradeUser !== undefined) {
        cookie(COOKIE_MAESTRO_MASCARADE, userId, {
          httpOnly: false,
          secure: config.environment === 'production'
        });
        cookie(COOKIE_MAESTRO_USER_ROLE, mascaradeUser.roles[0], {
          httpOnly: false,
          secure: config.environment === 'production'
        });
      }
      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
