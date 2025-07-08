import z from 'zod/v4';
import { Notice } from '../schema/RootNotice/Notice';
import { SubRoutes } from './routes';

export const noticesRoutes = {
  '/notices/:type': {
    params: {
      type: Notice.shape.type
    },
    get: {
      permissions: [],
      response: Notice
    },
    put: {
      body: Notice,
      permissions: ['administrationMaestro'],
      response: z.void()
    }
  }
} as const satisfies SubRoutes<'/notices/:type'>;
