import { constants } from 'node:http2';
import { noticesRepository } from '../repositories/noticesRepository';
import type {
  ProtectedSubRouter,
  UnprotectedSubRouter
} from '../routers/routes.type';

export const noticesUnprotectedRouter = {
  '/notices/:type': {
    get: async (_request, { type }) => {
      const notice = await noticesRepository.findByType(type);
      return { response: notice, status: constants.HTTP_STATUS_OK };
    }
  }
} as const satisfies UnprotectedSubRouter;

export const noticesProtectedRouter = {
  '/notices/:type': {
    put: async ({ body: noticeToUpdate }, { type }) => {
      await noticesRepository.update({ ...noticeToUpdate, type });

      return {
        status: constants.HTTP_STATUS_CREATED
      };
    }
  }
} as const satisfies ProtectedSubRouter;
