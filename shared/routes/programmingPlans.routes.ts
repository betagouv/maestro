import z from 'zod';
import { FindProgrammingPlanOptions } from '../schema/ProgrammingPlan/FindProgrammingPlanOptions';
import {
  ProgrammingPlanLocalStatus,
  ProgrammingSubPlanLocalStatus
} from '../schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import { ProgrammingPlanChecked } from '../schema/ProgrammingPlan/ProgrammingPlans';
import {
  ProgrammingSubPlan,
  ProgrammingSubPlanId
} from '../schema/ProgrammingPlan/ProgrammingSubPlan';
import {
  CreateProgrammingSubPlanFieldInput,
  UpdateProgrammingSubPlanFieldInput
} from '../schema/SpecificData/FieldConfigInput';
import {
  ProgrammingSubPlanFieldConfig,
  ProgrammingSubPlanFieldId,
  SpecificDataFieldOptionId
} from '../schema/SpecificData/ProgrammingSubPlanFieldConfig';
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
    }
  },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId': {
    params: {
      programmingPlanId: z.guid(),
      programmingSubPlanId: ProgrammingSubPlanId
    },
    put: {
      permissions: ['manageProgrammingPlan', 'approveProgrammingPlan'],
      body: z.object({
        status: ProgrammingSubPlanLocalStatus
      }),
      response: ProgrammingSubPlan
    }
  },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId': {
    params: {
      programmingPlanId: z.guid(),
      programmingSubPlanId: ProgrammingSubPlanId
    },
    put: {
      permissions: ['manageProgrammingPlan', 'approveProgrammingPlan'],
      body: z.object({
        status: ProgrammingSubPlanLocalStatus
      }),
      response: ProgrammingSubPlan
    }
  },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/local-status':
    {
      params: {
        programmingPlanId: z.guid(),
        programmingSubPlanId: ProgrammingSubPlanId
      },
      put: {
        permissions: [
          'manageProgrammingPlan',
          'approveProgrammingPlan',
          'distributePrescriptionToDepartments',
          'distributePrescriptionToSlaughterhouses'
        ],
        body: z.object({
          programmingPlanLocalStatusList: z.array(ProgrammingPlanLocalStatus)
        }),
        response: ProgrammingSubPlan
      }
    },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields':
    {
      params: {
        programmingPlanId: z.string(),
        programmingSubPlanId: ProgrammingSubPlanId
      },
      get: {
        response: z.array(ProgrammingSubPlanFieldConfig),
        permissions: 'NONE'
      },
      post: {
        permissions: ['administrationMaestro'],
        body: CreateProgrammingSubPlanFieldInput,
        response: ProgrammingSubPlanFieldConfig
      }
    },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields/:programmingSubPlanFieldId':
    {
      params: {
        programmingPlanId: z.string(),
        programmingSubPlanId: ProgrammingSubPlanId,
        programmingSubPlanFieldId: ProgrammingSubPlanFieldId
      },
      put: {
        permissions: ['administrationMaestro'],
        body: UpdateProgrammingSubPlanFieldInput,
        response: ProgrammingSubPlanFieldConfig
      },
      delete: {
        permissions: ['administrationMaestro'],
        response: z.undefined()
      }
    },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/specific-data-fields/:programmingSubPlanFieldId/options':
    {
      params: {
        programmingPlanId: z.string(),
        programmingSubPlanId: ProgrammingSubPlanId,
        programmingSubPlanFieldId: ProgrammingSubPlanFieldId
      },
      put: {
        permissions: ['administrationMaestro'],
        body: z.object({ optionIds: z.array(SpecificDataFieldOptionId) }),
        response: z.undefined()
      }
    }
} as const satisfies SubRoutes<'/programming-plans'>;
