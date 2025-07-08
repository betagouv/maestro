import { constants } from 'http2';
import BadRequestError from 'maestro-shared/errors/badRequestError';
import { noticesRepository } from '../repositories/noticesRepository';
import {
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
      if (noticeToUpdate.type !== type) {
        throw new BadRequestError();
      }

      await noticesRepository.update(noticeToUpdate);

      return {
        status: constants.HTTP_STATUS_CREATED
      };
    }
  }
} as const satisfies ProtectedSubRouter;
