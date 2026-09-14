import z from 'zod';
import {
  ProgrammingPlanDomain,
  ProgrammingPlanDomainCreateInput,
  ProgrammingPlanDomainId
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
  },
  '/programming-plan-domains/:programmingPlanDomainId': {
    params: {
      programmingPlanDomainId: ProgrammingPlanDomainId
    },
    delete: {
      accountPermissions: ['manageProgrammingPlanSettings'],
      response: z.undefined()
    }
  }
} as const satisfies SubRoutes<'/programming-plan-domains'>;
