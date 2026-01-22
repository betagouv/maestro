import z from 'zod';
import {
  SampleSpecificDataAttribute,
  SampleSpecificDataAttributeValue,
  SampleSpecificDataRecord
} from '../schema/Sample/SampleSpecificDataAttribute';
import { SubRoutes } from './routes';

export const sampleSpecificDataRoutes = {
  '/specific-data-attribute': {
    params: undefined,
    get: {
      response: SampleSpecificDataRecord,
      permissions: ['administrationMaestro']
    },
    post: {
      response: z.void(),
      body: SampleSpecificDataAttribute,
      permissions: ['administrationMaestro']
    }
  },
  '/specific-data-attribute/value': {
    params: undefined,
    post: {
      response: z.void(),
      body: SampleSpecificDataAttributeValue,
      permissions: ['administrationMaestro']
    }
  }
} as const satisfies SubRoutes<'/specific-data-attribute'>;
