import { constants } from 'http2';
import { laboratoryRepository } from '../repositories/laboratoryRepository';
import { ProtectedSubRouter } from '../routers/routes.type';

export const laboratoriesRouter = {
  '/laboratories/:laboratoryId': {
    get: async (_, { laboratoryId }) => {
      console.info('Get laboratory');

      const laboratory = await laboratoryRepository.findUnique(laboratoryId);

      if (!laboratory) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      return { status: constants.HTTP_STATUS_OK, response: laboratory };
    }
  },
  '/laboratories': {
    get: async (_) => {
      console.info('Find laboratories');

      const laboratories = await laboratoryRepository.findMany();

      return { status: constants.HTTP_STATUS_OK, response: laboratories };
    }
  }
} as const satisfies ProtectedSubRouter;
