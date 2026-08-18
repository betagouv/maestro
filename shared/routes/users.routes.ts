import z from 'zod';
import { FindUserOptions } from '../schema/User/FindUserOptions';
import {
  UserRefined,
  UserToCreateRefined,
  UserToUpdateRefined
} from '../schema/User/User';
import type { SubRoutes } from './routes';

export const usersRoutes = {
  '/users': {
    params: undefined,
    get: {
      response: z.array(UserRefined),
      query: FindUserOptions,
      permissions: 'NONE'
    },
    post: {
      response: z.undefined(),
      accountPermissions: ['manageUsers'],
      body: UserToCreateRefined
    }
  },
  '/users/:userId': {
    params: {
      userId: z.guid()
    },
    get: {
      response: UserRefined,
      permissions: 'NONE'
    },
    put: {
      response: z.undefined(),
      accountPermissions: ['manageUsers'],
      body: UserToUpdateRefined
    }
  },
  '/users/:userId/certification': {
    params: {
      userId: z.guid()
    },
    put: {
      response: z.undefined(),
      accountPermissions: ['administrationMaestro'],
      body: z.object({ certified: z.boolean() })
    }
  }
} as const satisfies SubRoutes<'/users'>;
