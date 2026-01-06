import z from 'zod';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import { SubRoutes } from './routes';

export const laboratoriesRoutes = {
  '/laboratories': {
    params: undefined,
    get: {
      response: z.array(Laboratory),
      permissions: 'NONE'
    }
  },
  '/laboratories/:laboratoryId': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      response: Laboratory,
      permissions: 'NONE'
    }
  }
} as const satisfies SubRoutes<'/laboratories'>;
