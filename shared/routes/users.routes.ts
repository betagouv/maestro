import z from 'zod';
import { FindUserOptions } from '../schema/User/FindUserOptions';
import { User } from '../schema/User/User';
import { SubRoutes } from './routes';

export const usersRoutes = {
  '/users': {
    params: undefined,
    get: {
      response: z.array(User),
      query: FindUserOptions,
      permissions: 'NONE'
    }
  },
  '/users/:userId': {
    params: {
      userId: z.guid()
    },
    get: {
      response: User,
      permissions: 'NONE'
    }
  }
} as const satisfies SubRoutes<'/users'>;
