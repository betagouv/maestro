import z from 'zod/v4';
import { FindProgrammingPlanOptions } from '../schema/ProgrammingPlan/FindProgrammingPlanOptions';
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
