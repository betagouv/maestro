import z from 'zod';
import {
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue
} from '../schema/Sample/SampleSpecificDataAttribute';
import {
  AdminFieldConfig,
  AdminFieldOption,
  CreateFieldInput,
  CreateFieldOptionInput,
  UpdateFieldInput,
  UpdateFieldOptionInput
} from '../schema/SpecificData/FieldConfigInput';
import {
  SachaFieldConfig,
  SpecificDataFieldId,
  SpecificDataFieldOptionId
} from '../schema/SpecificData/ProgrammingSubPlanFieldConfig';
import type { SubRoutes } from './routes';

export const specificDataFieldsRoutes = {
  '/specific-data-fields': {
    get: {
      permissions: ['administrationMaestro'],
      response: z.array(AdminFieldConfig)
    },
    post: {
      permissions: ['manageSpecificDataFields'],
      body: CreateFieldInput,
      response: AdminFieldConfig
    }
  },
  '/specific-data-fields/:fieldId': {
    params: {
      fieldId: SpecificDataFieldId
    },
    put: {
      permissions: ['manageSpecificDataFields'],
      body: UpdateFieldInput,
      response: AdminFieldConfig
    },
    delete: {
      permissions: ['manageSpecificDataFields'],
      response: z.undefined()
    }
  },
  '/specific-data-fields/:fieldId/options': {
    params: {
      fieldId: SpecificDataFieldId
    },
    post: {
      permissions: ['manageSpecificDataFields'],
      body: CreateFieldOptionInput,
      response: AdminFieldOption
    }
  },
  '/specific-data-fields/:fieldId/options/:optionId': {
    params: {
      fieldId: SpecificDataFieldId,
      optionId: SpecificDataFieldOptionId
    },
    put: {
      permissions: ['manageSpecificDataFields'],
      body: UpdateFieldOptionInput,
      response: AdminFieldOption
    },
    delete: {
      permissions: ['manageSpecificDataFields'],
      response: z.undefined()
    }
  },
  '/specific-data-fields/sacha': {
    get: {
      response: z.array(SachaFieldConfig),
      permissions: ['manageSpecificDataFields']
    }
  },
  '/specific-data-fields/attribute': {
    params: undefined,
    post: {
      response: z.undefined(),
      body: SampleSpecificDataAttribute,
      permissions: ['manageSpecificDataFields']
    }
  },
  '/specific-data-fields/attribute/value': {
    params: undefined,
    post: {
      response: z.undefined(),
      body: SampleSpecificDataAttributeValue,
      permissions: ['manageSpecificDataFields']
    }
  }
} as const satisfies SubRoutes<'/specific-data-fields'>;
