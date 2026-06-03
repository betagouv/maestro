import z from 'zod';
import { Notice } from '../schema/Notice/Notice';
import type { SubRoutes } from './routes';

export const noticesRoutes = {
  '/notices/:type': {
    params: {
      type: Notice.shape.type
    },
    get: {
      response: Notice,
      unprotected: true
    },
    put: {
      body: Notice.omit({ type: true }),
      permissions: ['administrationMaestro'],
      response: z.undefined()
    }
  }
} as const satisfies SubRoutes<'/notices/:type'>;
