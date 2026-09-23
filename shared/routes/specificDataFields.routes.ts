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
      accountPermissions: [
        'administrationMaestro',
        'manageProgrammingPlanSettings'
      ],
      response: z.array(AdminFieldConfig)
    },
    post: {
      accountPermissions: ['manageSpecificDataFields'],
      body: CreateFieldInput,
      response: AdminFieldConfig
    }
  },
  '/specific-data-fields/:fieldId': {
    params: {
      fieldId: SpecificDataFieldId
    },
    put: {
      accountPermissions: ['manageSpecificDataFields'],
      body: UpdateFieldInput,
      response: AdminFieldConfig
    },
    delete: {
      accountPermissions: ['manageSpecificDataFields'],
      response: z.undefined()
    }
  },
  '/specific-data-fields/:fieldId/options': {
    params: {
      fieldId: SpecificDataFieldId
    },
    post: {
      accountPermissions: ['manageSpecificDataFields'],
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
      accountPermissions: ['manageSpecificDataFields'],
      body: UpdateFieldOptionInput,
      response: AdminFieldOption
    },
    delete: {
      accountPermissions: ['manageSpecificDataFields'],
      response: z.undefined()
    }
  },
  '/specific-data-fields/sacha': {
    get: {
      response: z.array(SachaFieldConfig),
      accountPermissions: ['readSpecificDataFields']
    }
  },
  '/specific-data-fields/attribute': {
    params: undefined,
    post: {
      response: z.undefined(),
      body: SampleSpecificDataAttribute,
      accountPermissions: ['manageSpecificDataFields']
    }
  },
  '/specific-data-fields/attribute/value': {
    params: undefined,
    post: {
      response: z.undefined(),
      body: SampleSpecificDataAttributeValue,
      accountPermissions: ['manageSpecificDataFields']
    }
  }
} as const satisfies SubRoutes<'/specific-data-fields'>;
