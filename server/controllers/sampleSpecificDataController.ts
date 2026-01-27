import { constants } from 'http2';
import { sampleSpecificDataRepository } from '../repositories/sampleSpecificDataRepository';
import { ProtectedSubRouter } from '../routers/routes.type';

export const sampleSpecificDataProtectedRouter = {
  '/specific-data-attribute': {
    get: async () => {
      const specificData = await sampleSpecificDataRepository.findAll();

      return {
        response: specificData,
        status: constants.HTTP_STATUS_OK
      };
    },
    post: async ({ body }) => {
      await sampleSpecificDataRepository.updateSampleSpecificDataAttribute(
        body
      );
      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  },
  '/specific-data-attribute/value': {
    post: async ({ body }) => {
      await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue(
        body
      );
      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
