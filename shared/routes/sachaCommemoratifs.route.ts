import z from 'zod';
import { SachaCommemoratif } from '../schema/SachaCommemoratif/SachaCommemoratif';
import { SubRoutes } from './routes';

export const sachaCommemoratifsRoute = {
  '/sacha/commemoratifs': {
    params: undefined,
    get: {
      response: z.array(SachaCommemoratif),
      permissions: ['administrationMaestro']
    },
    post: {
      response: z.void(),
      body: z.object({ xmlContent: z.string() }),
      permissions: ['administrationMaestro'],
      skipSanitization: true
    }
  }
} as const satisfies SubRoutes<'/sacha/commemoratifs'>;
