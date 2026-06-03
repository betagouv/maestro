import { HttpStatus } from '../constants/httpStatus';
import { noticesRepository } from '../repositories/noticesRepository';
import type {
  ProtectedSubRouter,
  UnprotectedSubRouter
} from '../routers/routes.type';

export const noticesUnprotectedRouter = {
  '/notices/:type': {
    get: async (_request, { type }) => {
      const notice = await noticesRepository.findByType(type);
      return { response: notice, status: HttpStatus.OK };
    }
  }
} as const satisfies UnprotectedSubRouter;

export const noticesProtectedRouter = {
  '/notices/:type': {
    put: async ({ body: noticeToUpdate }, { type }) => {
      await noticesRepository.update({ ...noticeToUpdate, type });

      return {
        status: HttpStatus.CREATED
      };
    }
  }
} as const satisfies ProtectedSubRouter;
