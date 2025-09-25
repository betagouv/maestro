import z from 'zod';
import { SubRoutes } from './routes';

export const mascaradeRoutes = {
  '/mascarade/:userId': {
    params: {
      userId: z.guid()
    },
    post: {
      response: z.void(),
      permissions: ['administrationMaestro']
    }
  },
  '/mascarade': {
    params: undefined,
    post: {
      response: z.object({
        userId: z.string().nullable()
      }),
      permissions: 'NONE'
    }
  }
} as const satisfies SubRoutes<'/mascarade'>;
