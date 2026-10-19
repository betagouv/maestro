import { MatrixReferential } from '../schema/Matrix/MatrixReferential';
import type { SubRoutes } from './routes';

export const matricesRoutes = {
  '/matrices': {
    get: {
      permissions: 'NONE',
      response: MatrixReferential
    }
  }
} as const satisfies SubRoutes<'/matrices'>;
