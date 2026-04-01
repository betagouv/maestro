import z from 'zod';
import { FindProgrammingPlanOptions } from '../schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanKind } from '../schema/ProgrammingPlan/ProgrammingPlanKind';
import { ProgrammingPlanLocalStatus } from '../schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import { ProgrammingPlanStatus } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import {
  ProgrammingPlanChecked,
  ProgrammingPlanToUpsert
} from '../schema/ProgrammingPlan/ProgrammingPlans';
import {
  CreatePlanKindFieldInput,
  UpdatePlanKindFieldInput
} from '../schema/SpecificData/FieldConfigInput';
import {
  PlanKindFieldConfig,
  ProgrammingPlanKindFieldId,
  SpecificDataFieldOptionId
} from '../schema/SpecificData/PlanKindFieldConfig';
import type { SubRoutes } from './routes';

export const programmingPlansRoutes = {
  '/programming-plans': {
    get: {
      permissions: [
        'readProgrammingPlansInProgress',
        'readProgrammingPlanSubmittedToRegion',
        'readProgrammingPlanApprovedByRegion',
        'readProgrammingPlanSubmittedToDepartments',
        'readProgrammingPlanValidated',
        'readProgrammingPlanClosed'
      ],
      query: FindProgrammingPlanOptions,
      response: z.array(ProgrammingPlanChecked)
    },
    post: {
      permissions: ['administrationMaestro'],
      body: ProgrammingPlanToUpsert,
      response: ProgrammingPlanChecked
    }
  },
  '/programming-plans/:programmingPlanId': {
    params: {
      programmingPlanId: z.guid()
    },
    get: {
      permissions: [
        'readProgrammingPlansInProgress',
        'readProgrammingPlanSubmittedToRegion',
        'readProgrammingPlanApprovedByRegion',
        'readProgrammingPlanSubmittedToDepartments',
        'readProgrammingPlanValidated',
        'readProgrammingPlanClosed'
      ],
      response: ProgrammingPlanChecked
    },
    put: {
      permissions: ['administrationMaestro'],
      body: ProgrammingPlanToUpsert,
      response: ProgrammingPlanChecked
    }
  },
  '/programming-plans/:programmingPlanId/status': {
    params: {
      programmingPlanId: z.guid()
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
  '/programming-plans/:programmingPlanId/copy': {
    params: {
      programmingPlanId: z.guid()
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
    },
    post: {
      permissions: ['administrationMaestro'],
      body: CreatePlanKindFieldInput,
      response: PlanKindFieldConfig
    }
  },
  '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId':
    {
      params: {
        programmingPlanId: z.string(),
        kind: ProgrammingPlanKind,
        planKindFieldId: ProgrammingPlanKindFieldId
      },
      put: {
        permissions: ['administrationMaestro'],
        body: UpdatePlanKindFieldInput,
        response: PlanKindFieldConfig
      },
      delete: {
        permissions: ['administrationMaestro'],
        response: z.void()
      }
    },
  '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields/:planKindFieldId/options':
    {
      params: {
        programmingPlanId: z.string(),
        kind: ProgrammingPlanKind,
        planKindFieldId: ProgrammingPlanKindFieldId
      },
      put: {
        permissions: ['administrationMaestro'],
        body: z.array(SpecificDataFieldOptionId),
        response: z.void()
      }
    }
} as const satisfies SubRoutes<'/programming-plans'>;
