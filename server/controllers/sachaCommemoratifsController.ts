import { constants } from 'http2';
import { sachaCommemoratifRepository } from '../repositories/sachaCommemoratifRepository';
import { ProtectedSubRouter } from '../routers/routes.type';
import { updateSachaCommemoratifs } from '../services/ediSacha/sachaCommemoratifsService';

export const sachaCommemoratifsProtectedRouter = {
  '/sacha/commemoratifs': {
    get: async () => {
      const commemoratifs = await sachaCommemoratifRepository.findAll();

      return {
        response: commemoratifs,
        status: constants.HTTP_STATUS_OK
      };
    },
    post: async ({ body: { xmlContent } }) => {
      await updateSachaCommemoratifs(xmlContent);
      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
