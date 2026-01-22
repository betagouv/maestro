import { constants } from 'http2';
import { programmingPlanSpecificDataRepository } from '../repositories/programmingPlanSpecificDataRepository';
import { ProtectedSubRouter } from '../routers/routes.type';

export const programmingPlanSpecificDataProtectedRouter = {
  '/programming-plans/specific-data-attribute': {
    get: async () => {
      const specificData =
        await programmingPlanSpecificDataRepository.findAll();

      return {
        response: specificData,
        status: constants.HTTP_STATUS_OK
      };
    },
    post: async ({ body }) => {
      await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttribute(
        body
      );
      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  },
  '/programming-plans/specific-data-attribute/value': {
    post: async ({ body }) => {
      await programmingPlanSpecificDataRepository.updateProgrammingPlanSpecificDataAttributeValue(
        body
      );
      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
