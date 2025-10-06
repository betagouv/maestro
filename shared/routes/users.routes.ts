import z from 'zod';
import { FindUserOptions } from '../schema/User/FindUserOptions';
import { User, UserToCreate, UserToUpdate } from '../schema/User/User';
import { SubRoutes } from './routes';

export const usersRoutes = {
  '/users': {
    params: undefined,
    get: {
      response: z.array(User),
      query: FindUserOptions,
      permissions: 'NONE'
    },
    post: {
      response: z.void(),
      permissions: ['administrationMaestro'],
      body: UserToCreate
    }
  },
  '/users/:userId': {
    params: {
      userId: z.guid()
    },
    get: {
      response: User,
      permissions: 'NONE'
    },
    put: {
      response: z.void(),
      permissions: ['administrationMaestro'],
      body: UserToUpdate
    }
  }
} as const satisfies SubRoutes<'/users'>;
