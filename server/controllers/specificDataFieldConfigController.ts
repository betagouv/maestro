import { constants } from 'node:http2';
import { sampleSpecificDataRepository } from '../repositories/sampleSpecificDataRepository';
import { specificDataFieldConfigRepository } from '../repositories/specificDataFieldConfigRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const specificDataFieldConfigRouter = {
  '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields': {
    get: async (_, { programmingPlanId, kind }) => {
      console.info('Get specific data field configs for plan kind', kind);

      const configs = await specificDataFieldConfigRepository.findByPlanKind(
        programmingPlanId,
        kind
      );

      return {
        status: constants.HTTP_STATUS_OK,
        response: configs
      };
    }
  },
  '/specific-data-fields/sacha': {
    get: async () => {
      console.info('Get specific data field configs for Sacha');

      const fields = await specificDataFieldConfigRepository.findSachaFields();

      return {
        status: constants.HTTP_STATUS_OK,
        response: fields
      };
    }
  },
  '/specific-data-fields/attribute': {
    post: async ({ body }) => {
      await sampleSpecificDataRepository.updateSampleSpecificDataAttribute(
        body
      );
      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  },
  '/specific-data-fields/attribute/value': {
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
