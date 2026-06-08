import { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  ProgrammingSubPlanFieldId,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from 'maestro-shared/schema/SpecificData/ProgrammingSubPlanFieldConfig';
import { HttpStatus } from '../constants/httpStatus';
import { sampleSpecificDataRepository } from '../repositories/sampleSpecificDataRepository';
import { specificDataFieldConfigRepository } from '../repositories/specificDataFieldConfigRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const specificDataFieldConfigRouter = {
  '/specific-data-fields': {
    get: async () => {
      console.info('Get all specific data field configs');

      const fields = await specificDataFieldConfigRepository.findAllFields();

      return {
        status: HttpStatus.OK,
        response: fields
      };
    },
    post: async ({ body }) => {
      console.info('Create specific data field', body.key);

      const field = await specificDataFieldConfigRepository.createField(body);

      return {
        status: HttpStatus.CREATED,
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
        return { status: HttpStatus.NOT_FOUND };
      }

      return {
        status: HttpStatus.OK,
        response: field
      };
    },
    delete: async (_, { fieldId }) => {
      console.info('Delete specific data field', fieldId);

      await specificDataFieldConfigRepository.deleteField(
        SpecificDataFieldId.parse(fieldId)
      );

      return { status: HttpStatus.NO_CONTENT };
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
        return { status: HttpStatus.NOT_FOUND };
      }

      return {
        status: HttpStatus.CREATED,
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
        return { status: HttpStatus.NOT_FOUND };
      }

      return {
        status: HttpStatus.OK,
        response: option
      };
    },
    delete: async (_, { fieldId: _fieldId, optionId }) => {
      console.info('Delete option', optionId);

      await specificDataFieldConfigRepository.deleteFieldOption(
        SpecificDataFieldOptionId.parse(optionId)
      );

      return { status: HttpStatus.NO_CONTENT };
    }
  },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields':
    {
      get: async (_, { programmingSubPlanId }) => {
        console.info(
          'Get specific data field configs for sub-plan',
          programmingSubPlanId
        );

        const configs =
          await specificDataFieldConfigRepository.findByPlanSubPlan(
            ProgrammingSubPlanId.parse(programmingSubPlanId)
          );

        return {
          status: HttpStatus.OK,
          response: configs
        };
      },
      post: async ({ body }, { programmingSubPlanId }) => {
        console.info('Add field to sub-plan', programmingSubPlanId);

        const config =
          await specificDataFieldConfigRepository.addFieldToPlanKind(
            ProgrammingSubPlanId.parse(programmingSubPlanId),
            body
          );

        if (!config) {
          return { status: HttpStatus.NOT_FOUND };
        }

        return {
          status: HttpStatus.CREATED,
          response: config
        };
      }
    },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields/:programmingSubPlanFieldId':
    {
      put: async ({ body }, { programmingSubPlanFieldId }) => {
        console.info('Update plan kind field', programmingSubPlanFieldId);

        const config =
          await specificDataFieldConfigRepository.updateProgrammingSubPlanField(
            ProgrammingSubPlanFieldId.parse(programmingSubPlanFieldId),
            body
          );

        if (!config) {
          return { status: HttpStatus.NOT_FOUND };
        }

        return {
          status: HttpStatus.OK,
          response: config
        };
      },
      delete: async (_, { programmingSubPlanFieldId }) => {
        console.info('Remove plan kind field', programmingSubPlanFieldId);

        await specificDataFieldConfigRepository.removeProgrammingSubPlanField(
          ProgrammingSubPlanFieldId.parse(programmingSubPlanFieldId)
        );

        return { status: HttpStatus.NO_CONTENT };
      }
    },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields/:programmingSubPlanFieldId/options':
    {
      put: async ({ body }, { programmingSubPlanFieldId }) => {
        console.info(
          'Replace plan kind field options',
          programmingSubPlanFieldId
        );

        await specificDataFieldConfigRepository.replaceProgrammingSubPlanFieldOptions(
          ProgrammingSubPlanFieldId.parse(programmingSubPlanFieldId),
          body.optionIds.map((id) => SpecificDataFieldOptionId.parse(id))
        );

        return { status: HttpStatus.NO_CONTENT };
      }
    },
  '/specific-data-fields/sacha': {
    get: async () => {
      console.info('Get specific data field configs for Sacha');

      const fields = await specificDataFieldConfigRepository.findSachaFields();

      return {
        status: HttpStatus.OK,
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
        status: HttpStatus.OK
      };
    }
  },
  '/specific-data-fields/attribute/value': {
    post: async ({ body }) => {
      await sampleSpecificDataRepository.updateSampleSpecificDataAttributeValue(
        body
      );
      return {
        status: HttpStatus.OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
