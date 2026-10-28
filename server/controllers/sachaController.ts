import { HttpStatus } from '../constants/httpStatus';
import { sachaCommemoratifRepository } from '../repositories/sachaCommemoratifRepository';
import { sachaContextRepository } from '../repositories/sachaContextRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { importSachaReferential } from '../services/ediSacha/sachaReferentialService';

export const sachaProtectedRouter = {
  '/sacha/commemoratifs': {
    get: async () => {
      const commemoratifs = await sachaCommemoratifRepository.findAll();
      return {
        response: commemoratifs,
        status: HttpStatus.OK
      };
    }
  },
  '/sacha/contexts': {
    get: async () => {
      const contexts = await sachaContextRepository.findUsable();
      return {
        response: contexts,
        status: HttpStatus.OK
      };
    }
  },
  '/sacha/referentials': {
    post: async ({ body: { xmlContent } }) => {
      const referentialImport = await importSachaReferential(xmlContent);
      return {
        response: referentialImport,
        status: HttpStatus.OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
