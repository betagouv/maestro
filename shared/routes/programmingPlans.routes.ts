import z from 'zod';
import { FindProgrammingPlanOptions } from '../schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanLocalStatus } from '../schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import { ProgrammingPlanStatus } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { ProgrammingPlanChecked } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { PlanKindFieldConfig } from '../schema/SpecificData/PlanKindFieldConfig';
import type { SubRoutes } from './routes';

export const programmingPlansRoutes = {
  '/programming-plans': {
    get: {
      permissions: ['readProgrammingPlans'],
      query: FindProgrammingPlanOptions,
      response: z.array(ProgrammingPlanChecked)
    }
  },
  '/programming-plans/:programmingPlanId': {
    params: {
      programmingPlanId: z.guid()
    },
    get: {
      permissions: ['readProgrammingPlans'],
      response: ProgrammingPlanChecked
    },
    put: {
      permissions: ['manageProgrammingPlan', 'approveProgrammingPlan'],
      body: z.object({
        status: ProgrammingPlanStatus
      }),
      response: ProgrammingPlanChecked
    }
  },
  '/programming-plans/:programmingPlanId/local-status': {
    params: {
      programmingPlanId: z.guid()
    },
    put: {
      permissions: [
        'manageProgrammingPlan',
        'approveProgrammingPlan',
        'distributePrescriptionToDepartments',
        'distributePrescriptionToSlaughterhouses'
      ],
      body: z.array(ProgrammingPlanLocalStatus),
      response: ProgrammingPlanChecked
    }
  },
  '/programming-plans/years/:year': {
    params: {
      year: z.coerce.number().int()
    },
    post: {
      permissions: ['manageProgrammingPlan'],
      response: ProgrammingPlanChecked
    }
  },
  '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields': {
    params: {
      programmingPlanId: z.string(),
      kind: ProgrammingPlanKind
    },
    get: {
      response: z.array(PlanKindFieldConfig),
      permissions: 'NONE'
    }
  }
} as const satisfies SubRoutes<'/programming-plans'>;
