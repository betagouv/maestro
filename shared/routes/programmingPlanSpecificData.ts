import z from 'zod';
import {
  ProgrammingPlanSpecificDataAttribute,
  ProgrammingPlanSpecificDataAttributeValue,
  ProgrammingPlanSpecificDataRecord
} from '../schema/ProgrammingPlan/ProgrammingPlanSpecificDataAttribute';
import { SubRoutes } from './routes';

export const programmingPlanSpecificDataRoutes = {
  '/programming-plans/specific-data-attribute': {
    params: undefined,
    get: {
      response: ProgrammingPlanSpecificDataRecord,
      permissions: ['administrationMaestro']
    },
    post: {
      response: z.void(),
      body: ProgrammingPlanSpecificDataAttribute,
      permissions: ['administrationMaestro']
    }
  },
  '/programming-plans/specific-data-attribute/value': {
    params: undefined,
    post: {
      response: z.void(),
      body: ProgrammingPlanSpecificDataAttributeValue,
      permissions: ['administrationMaestro']
    }
  }
} as const satisfies SubRoutes<'/programming-plans/specific-data-attribute'>;
