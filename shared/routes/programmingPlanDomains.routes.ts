import z from 'zod';
import {
  ProgrammingPlanDomain,
  ProgrammingPlanDomainCreateInput
} from '../schema/ProgrammingPlan/ProgrammingPlanDomain';
import type { SubRoutes } from './routes';

export const programmingPlanDomainsRoutes = {
  '/programming-plan-domains': {
    get: {
      permissions: 'NONE',
      response: z.array(ProgrammingPlanDomain)
    },
    post: {
      permissions: ['manageProgrammingPlanSettings'],
      body: ProgrammingPlanDomainCreateInput,
      response: ProgrammingPlanDomain
    }
  }
} as const satisfies SubRoutes<'/programming-plan-domains'>;
