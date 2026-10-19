import { HttpStatus } from '../constants/httpStatus';
import { matrixRepository } from '../repositories/matrixRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const matrixRouter = {
  '/matrices': {
    get: async () => {
      const referential = await matrixRepository.findReferential();
      return { response: referential, status: HttpStatus.OK };
    }
  }
} as const satisfies ProtectedSubRouter;
