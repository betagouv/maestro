import z from 'zod';
import { FindUserOptions } from '../schema/User/FindUserOptions';
import {
  UserRefined,
  UserToCreateRefined,
  UserToUpdateRefined
} from '../schema/User/User';
import { SubRoutes } from './routes';

export const usersRoutes = {
  '/users': {
    params: undefined,
    get: {
      response: z.array(UserRefined),
      query: FindUserOptions,
      permissions: 'NONE'
    },
    post: {
      response: z.void(),
      permissions: ['administrationMaestro'],
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
      response: z.void(),
      permissions: ['administrationMaestro'],
      body: UserToUpdateRefined
    }
  }
} as const satisfies SubRoutes<'/users'>;
