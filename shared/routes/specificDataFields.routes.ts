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
} from '../schema/SpecificData/PlanKindFieldConfig';
import type { SubRoutes } from './routes';

export const specificDataFieldsRoutes = {
  '/specific-data-fields': {
    get: {
      permissions: ['administrationMaestro'],
      response: z.array(AdminFieldConfig)
    },
    post: {
      permissions: ['administrationMaestro'],
      body: CreateFieldInput,
      response: AdminFieldConfig
    }
  },
  '/specific-data-fields/:fieldId': {
    params: {
      fieldId: SpecificDataFieldId
    },
    put: {
      permissions: ['administrationMaestro'],
      body: UpdateFieldInput,
      response: AdminFieldConfig
    },
    delete: {
      permissions: ['administrationMaestro'],
      response: z.void()
    }
  },
  '/specific-data-fields/:fieldId/options': {
    params: {
      fieldId: SpecificDataFieldId
    },
    post: {
      permissions: ['administrationMaestro'],
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
      permissions: ['administrationMaestro'],
      body: UpdateFieldOptionInput,
      response: AdminFieldOption
    },
    delete: {
      permissions: ['administrationMaestro'],
      response: z.void()
    }
  },
  '/specific-data-fields/sacha': {
    get: {
      response: z.array(SachaFieldConfig),
      permissions: ['administrationMaestro']
    }
  },
  '/specific-data-fields/attribute': {
    params: undefined,
    post: {
      response: z.void(),
      body: SampleSpecificDataAttribute,
      permissions: ['administrationMaestro']
    }
  },
  '/specific-data-fields/attribute/value': {
    params: undefined,
    post: {
      response: z.void(),
      body: SampleSpecificDataAttributeValue,
      permissions: ['administrationMaestro']
    }
  }
} as const satisfies SubRoutes<'/specific-data-fields'>;
