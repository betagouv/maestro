import z from 'zod';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { PlanKindFieldConfig } from '../schema/SpecificData/PlanKindFieldConfig';
import { SubRoutes } from './routes';

export const programmingPlanKindFieldsRoutes = {
  '/programming-plan-kinds/:kind/specific-data-fields': {
    params: {
      kind: ProgrammingPlanKind
    },
    get: {
      response: z.array(PlanKindFieldConfig),
      permissions: 'NONE'
    }
  }
} as const satisfies SubRoutes<'/programming-plan-kinds/:kind/specific-data-fields'>;
