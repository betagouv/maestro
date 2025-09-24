import { AuthRedirectUrl } from '../schema/Auth/AuthRedirectUrl';
import { AuthMaybeUnknownUser } from '../schema/User/AuthUser';
import { SubRoutes } from './routes';

export const authRoutes = {
  '/auth': {
    params: undefined,
    post: {
      body: AuthRedirectUrl,
      response: AuthMaybeUnknownUser,
      unprotected: true,
      skipSanitization: true
    }
  },
  '/auth/redirect-url': {
    params: undefined,
    get: {
      response: AuthRedirectUrl,
      unprotected: true
    }
  },
  '/auth/logout': {
    params: undefined,
    post: {
      permissions: 'NONE',
      response: AuthRedirectUrl
    }
  }
} as const satisfies SubRoutes<'/auth'>;
