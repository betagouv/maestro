import z from 'zod';
import {
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue
} from '../schema/Sample/SampleSpecificDataAttribute';
import { SachaFieldConfig } from '../schema/SpecificData/PlanKindFieldConfig';
import { SubRoutes } from './routes';

export const specificDataFieldsRoutes = {
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
} as const satisfies SubRoutes<
  '/specific-data-fields/sacha' | '/specific-data-fields/attribute'
>;
