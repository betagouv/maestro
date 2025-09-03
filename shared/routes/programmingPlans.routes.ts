import z from 'zod';
import { FindProgrammingPlanOptions } from '../schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanRegionalStatus } from '../schema/ProgrammingPlan/ProgrammingPlanRegionalStatus';
import { ProgrammingPlan } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatus } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { SubRoutes } from './routes';

export const programmingPlansRoutes = {
  '/programming-plans': {
    get: {
      permissions: ['readProgrammingPlans'],
      query: FindProgrammingPlanOptions,
      response: z.array(ProgrammingPlan)
    }
  },
  '/programming-plans/:programmingPlanId': {
    params: {
      programmingPlanId: z.guid()
    },
    get: {
      permissions: ['readProgrammingPlans'],
      response: ProgrammingPlan
    },
    put: {
      permissions: ['manageProgrammingPlan', 'approveProgrammingPlan'],
      body: z.object({
        status: ProgrammingPlanStatus
      }),
      response: ProgrammingPlan
    }
  },
  '/programming-plans/:programmingPlanId/regional-status': {
    params: {
      programmingPlanId: z.guid()
    },
    put: {
      permissions: ['manageProgrammingPlan', 'approveProgrammingPlan'],
      body: z.array(ProgrammingPlanRegionalStatus),
      response: ProgrammingPlan
    }
  },
  '/programming-plans/years/:year': {
    params: {
      year: z.coerce.number().int()
    },
    get: {
      permissions: ['readProgrammingPlans'],
      response: ProgrammingPlan
    },
    post: {
      permissions: ['manageProgrammingPlan'],
      response: ProgrammingPlan
    }
  }
} as const satisfies SubRoutes<'/programming-plans'>;
