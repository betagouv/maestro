import { HttpStatus } from '../constants/httpStatus';
import { sachaCommemoratifRepository } from '../repositories/sachaCommemoratifRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { updateSachaCommemoratifs } from '../services/ediSacha/sachaCommemoratifsService';

export const sachaCommemoratifsProtectedRouter = {
  '/sacha/commemoratifs': {
    get: async () => {
      const commemoratifs = await sachaCommemoratifRepository.findAll();
      return {
        response: commemoratifs,
        status: HttpStatus.OK
      };
    },
    post: async ({ body: { xmlContent } }) => {
      await updateSachaCommemoratifs(xmlContent);
      return {
        status: HttpStatus.OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
