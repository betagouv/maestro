import z from 'zod';
import { SachaFieldConfig } from '../schema/SpecificData/PlanKindFieldConfig';
import { SubRoutes } from './routes';

export const specificDataFieldsRoutes = {
  '/specific-data-fields/sacha': {
    get: {
      response: z.array(SachaFieldConfig),
      permissions: ['administrationMaestro']
    }
  }
} as const satisfies SubRoutes<'/specific-data-fields/sacha'>;
