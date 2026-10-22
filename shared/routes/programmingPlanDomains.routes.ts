import z from 'zod';
import {
  ProgrammingPlanDomain,
  ProgrammingPlanDomainCreateInput,
  ProgrammingPlanDomainId,
  ProgrammingPlanDomainUpdateInput
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
  '/programming-plan-domains/campaigns': {
    post: {
      accountPermissions: ['administrationMaestro'],
      response: z.undefined()
    }
  },
  '/programming-plan-domains/:programmingPlanDomainId/duplicate': {
    params: {
      programmingPlanDomainId: ProgrammingPlanDomainId
    },
    post: {
      accountPermissions: ['manageProgrammingPlanSettings'],
      response: ProgrammingPlanDomain
    }
  },
  '/programming-plan-domains/:programmingPlanDomainId': {
    params: {
      programmingPlanDomainId: ProgrammingPlanDomainId
    },
    put: {
      accountPermissions: ['manageProgrammingPlanSettings'],
      body: ProgrammingPlanDomainUpdateInput,
      response: ProgrammingPlanDomain
    },
    delete: {
      accountPermissions: ['manageProgrammingPlanSettings'],
      response: z.undefined()
    }
  }
} as const satisfies SubRoutes<'/programming-plan-domains'>;
