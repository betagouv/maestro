import { z } from 'zod';
import { AuthRedirectUrl } from '../schema/Auth/AuthRedirectUrl';
import { AuthMaybeUnknownUser, AuthUserRefined } from '../schema/User/AuthUser';
import { UserRole } from '../schema/User/UserRole';
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
  '/auth/role': {
    params: undefined,
    post: {
      body: z.object({
        newRole: UserRole
      }),
      permissions: 'NONE',
      response: AuthUserRefined
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
