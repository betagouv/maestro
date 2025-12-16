import { constants } from 'http2';
import jwt from 'jsonwebtoken';
import {
  COOKIE_MAESTRO_ACCESS_TOKEN,
  COOKIE_MAESTRO_USER_ROLE
} from 'maestro-shared/constants';
import AuthenticationFailedError from 'maestro-shared/errors/authenticationFailedError';
import { AuthMaybeUnknownUser } from 'maestro-shared/schema/User/AuthUser';
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '../middlewares/checks/authCheck';
import { userRepository } from '../repositories/userRepository';
import {
  ProtectedSubRouter,
  UnprotectedSubRouter
} from '../routers/routes.type';
import { getAuthService } from '../services/authService';
import config from '../utils/config';

export const authUnprotectedRouter = {
  '/auth/redirect-url': {
    get: async () => {
      const authService = await getAuthService;
      // given_name et usual_name sont que pour ProConnect
      const authRedirectUrl = authService.getAuthorizationUrl(
        'openid profile email given_name usual_name'
      );

      return { status: constants.HTTP_STATUS_OK, response: authRedirectUrl };
    }
  },
  '/auth': {
    post: async ({ body: authRedirectUrl, cookies }, _, { cookie }) => {
      const authService = await getAuthService;

      console.log('authenticate', authRedirectUrl);

      try {
        const { idToken, email, name } =
          await authService.authenticate(authRedirectUrl);

        const user = await userRepository.findOne(email);
        if (user && user.name !== name) {
          await userRepository.update({ name }, user.id);
        }

        const loggedSecret = uuidv4();
        const tokenPayload: TokenPayload = {
          userId: user?.id ?? null,
          loggedSecret: user?.id ? loggedSecret : null,
          idToken
        };
        const accessToken = jwt.sign(tokenPayload, config.auth.secret, {
          expiresIn: config.auth.expiresIn
        });
        if (user) {
          await userRepository.addLoggedSecret(loggedSecret, user.id);
        }
        const result: AuthMaybeUnknownUser =
          user !== undefined
            ? {
                user: await getUser(cookies, user),
                userRole: user.roles[0]
              }
            : {
                user: null,
                userRole: null,
                userEmail: email
              };

        cookie(COOKIE_MAESTRO_ACCESS_TOKEN, accessToken, {
          httpOnly: true,
          secure: config.environment === 'production'
        });

        if (user) {
          cookie(COOKIE_MAESTRO_USER_ROLE, user.roles[0], {
            httpOnly: false,
            secure: config.environment === 'production'
          });
        }

        return { status: constants.HTTP_STATUS_OK, response: result };
      } catch (error) {
        console.error('Error while authenticating', error);
        throw new AuthenticationFailedError();
      }
    }
  }
} as const satisfies UnprotectedSubRouter;

export const authProtectedRouter = {
  '/auth/logout': {
    post: async ({ auth }, _p, { clearCookie }) => {
      const { idToken, userId, loggedSecret } = auth;
      const authService = await getAuthService;

      const logoutUrl = authService.getLogoutUrl(idToken);

      clearCookie(COOKIE_MAESTRO_ACCESS_TOKEN);

      if (userId && loggedSecret) {
        await userRepository.deleteLoggedSecret(loggedSecret, userId);
      }

      return { status: constants.HTTP_STATUS_OK, response: logoutUrl };
    }
  }
} as const satisfies ProtectedSubRouter;
