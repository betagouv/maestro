import { constants } from 'http2';
import { specificDataFieldConfigRepository } from '../repositories/specificDataFieldConfigRepository';
import { ProtectedSubRouter } from '../routers/routes.type';

export const specificDataFieldConfigRouter = {
  '/programming-plan-kinds/:kind/specific-data-fields': {
    get: async (_, { kind }) => {
      console.info('Get specific data field configs for plan kind', kind);

      const configs =
        await specificDataFieldConfigRepository.findByPlanKind(kind);

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
  }
} as const satisfies ProtectedSubRouter;
