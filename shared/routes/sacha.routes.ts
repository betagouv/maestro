import z from 'zod';
import { SachaCommemoratifRecord } from '../schema/SachaCommemoratif/SachaCommemoratif';
import {
  SachaContext,
  SachaReferentialImport
} from '../schema/SachaContext/SachaContext';
import type { SubRoutes } from './routes';

export const sachaRoutes = {
  '/sacha/commemoratifs': {
    params: undefined,
    get: {
      response: SachaCommemoratifRecord,
      accountPermissions: ['readSpecificDataFields']
    }
  },
  '/sacha/contexts': {
    params: undefined,
    get: {
      response: z.array(SachaContext),
      accountPermissions: ['manageProgrammingPlanSettings']
    }
  },
  '/sacha/referentials': {
    params: undefined,
    post: {
      response: SachaReferentialImport,
      body: z.object({ xmlContent: z.string() }),
      accountPermissions: ['manageSpecificDataFields'],
      skipSanitization: true
    }
  }
} as const satisfies SubRoutes<
  '/sacha/commemoratifs' | '/sacha/contexts' | '/sacha/referentials'
>;
