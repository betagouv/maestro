import { constants } from 'http2';
import { COOKIE_MAESTRO_MASCARADE } from 'maestro-shared/constants';
import { ProtectedSubRouter } from '../routers/routes.type';
import config from '../utils/config';

export const mascaradeRouter = {
  '/mascarade': {
    post: async (req, _param, { clearCookie }) => {
      clearCookie(COOKIE_MAESTRO_MASCARADE);

      return {
        status: constants.HTTP_STATUS_OK,
        response: { userId: req.auth.userId }
      };
    }
  },
  '/mascarade/:userId': {
    post: async (_req, { userId }, { cookie }) => {
      cookie(COOKIE_MAESTRO_MASCARADE, userId, {
        httpOnly: false,
        secure: config.environment === 'production'
      });
      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
