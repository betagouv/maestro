import { constants } from 'node:http2';
import {
  ProgrammingPlanKindFieldId,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/PlanKindFieldConfig';
import { sampleSpecificDataRepository } from '../repositories/sampleSpecificDataRepository';
import { specificDataFieldConfigRepository } from '../repositories/specificDataFieldConfigRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const specificDataFieldConfigRouter = {
  '/specific-data-fields': {
    get: async () => {
      console.info('Get all specific data field configs');

      const fields = await specificDataFieldConfigRepository.findAllFields();

      return {
        status: constants.HTTP_STATUS_OK,
        response: fields
      };
    },
    post: async ({ body }) => {
      console.info('Create specific data field', body.key);

      const field = await specificDataFieldConfigRepository.createField(body);

      return {
        status: constants.HTTP_STATUS_CREATED,
        response: field
      };
    }
  },
  '/specific-data-fields/:fieldId': {
    put: async ({ body }, { fieldId }) => {
      console.info('Update specific data field', fieldId);

      const field = await specificDataFieldConfigRepository.updateField(
        SpecificDataFieldId.parse(fieldId),
        body
      );

      if (!field) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      return {
        status: constants.HTTP_STATUS_OK,
        response: field
      };
    },
    delete: async (_, { fieldId }) => {
      console.info('Delete specific data field', fieldId);

      await specificDataFieldConfigRepository.deleteField(
        SpecificDataFieldId.parse(fieldId)
      );

      return { status: constants.HTTP_STATUS_NO_CONTENT };
    }
  },
  '/specific-data-fields/:fieldId/options': {
    post: async ({ body }, { fieldId }) => {
      console.info('Create option for specific data field', fieldId);

      const option = await specificDataFieldConfigRepository.createFieldOption(
        SpecificDataFieldId.parse(fieldId),
        body
      );

      if (!option) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      return {
        status: constants.HTTP_STATUS_CREATED,
        response: option
      };
    }
  },
  '/specific-data-fields/:fieldId/options/:optionId': {
    put: async ({ body }, { fieldId: _fieldId, optionId }) => {
      console.info('Update option', optionId);

      const option = await specificDataFieldConfigRepository.updateFieldOption(
        SpecificDataFieldOptionId.parse(optionId),
        body
      );

      if (!option) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      return {
        status: constants.HTTP_STATUS_OK,
        response: option
      };
    },
    delete: async (_, { fieldId: _fieldId, optionId }) => {
      console.info('Delete option', optionId);

      await specificDataFieldConfigRepository.deleteFieldOption(
        SpecificDataFieldOptionId.parse(optionId)
      );

      return { status: constants.HTTP_STATUS_NO_CONTENT };
    }
  },
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
    },
    post: async ({ body }, { programmingPlanId, kind }) => {
      console.info('Add field to plan kind', kind);

      const config = await specificDataFieldConfigRepository.addFieldToPlanKind(
        programmingPlanId,
        kind,
        body
      );

      if (!config) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      return {
        status: constants.HTTP_STATUS_CREATED,
        response: config
      };
    }
  },
  '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId':
    {
      put: async ({ body }, { planKindFieldId }) => {
        console.info('Update plan kind field', planKindFieldId);

        const config =
          await specificDataFieldConfigRepository.updatePlanKindField(
            ProgrammingPlanKindFieldId.parse(planKindFieldId),
            body
          );

        if (!config) {
          return { status: constants.HTTP_STATUS_NOT_FOUND };
        }

        return {
          status: constants.HTTP_STATUS_OK,
          response: config
        };
      },
      delete: async (_, { planKindFieldId }) => {
        console.info('Remove plan kind field', planKindFieldId);

        await specificDataFieldConfigRepository.removePlanKindField(
          ProgrammingPlanKindFieldId.parse(planKindFieldId)
        );

        return { status: constants.HTTP_STATUS_NO_CONTENT };
      }
    },
  '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId/options':
    {
      put: async ({ body }, { planKindFieldId }) => {
        console.info('Replace plan kind field options', planKindFieldId);

        await specificDataFieldConfigRepository.replacePlanKindFieldOptions(
          ProgrammingPlanKindFieldId.parse(planKindFieldId),
          body.map((id) => SpecificDataFieldOptionId.parse(id))
        );

        return { status: constants.HTTP_STATUS_NO_CONTENT };
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
