import z from 'zod';
import { SachaCommemoratifRecord } from '../schema/SachaCommemoratif/SachaCommemoratif';
import type { SubRoutes } from './routes';

export const sachaCommemoratifsRoute = {
  '/sacha/commemoratifs': {
    params: undefined,
    get: {
      response: SachaCommemoratifRecord,
      accountPermissions: ['readSpecificDataFields']
    },
    post: {
      response: z.undefined(),
      body: z.object({ xmlContent: z.string() }),
      accountPermissions: ['manageSpecificDataFields'],
      skipSanitization: true
    }
  }
} as const satisfies SubRoutes<'/sacha/commemoratifs'>;
