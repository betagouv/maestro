import z from 'zod';
import { Notice } from '../schema/Notice/Notice';
import { SubRoutes } from './routes';

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
      body: Notice,
      permissions: ['administrationMaestro'],
      response: z.void()
    }
  }
} as const satisfies SubRoutes<'/notices/:type'>;
