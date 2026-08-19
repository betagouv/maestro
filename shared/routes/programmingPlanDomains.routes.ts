import z from 'zod';
import { ProgrammingPlanDomain } from '../schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { SubRoutes } from './routes';

export const programmingPlanDomainsRoutes = {
  '/programming-plan-domains': {
    get: {
      permissions: 'NONE',
      response: z.array(ProgrammingPlanDomain)
    }
  }
} as const satisfies SubRoutes<'/programming-plan-domains'>;
