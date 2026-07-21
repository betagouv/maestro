import z from 'zod';
import { FindProgrammingPlanOptions } from '../schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanLocalStatus } from '../schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import { ProgrammingPlanStatus } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { ProgrammingPlanChecked } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingSubPlanId } from '../schema/ProgrammingPlan/ProgrammingSubPlan';
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
      body: z.object({
        programmingPlanLocalStatusList: z.array(
          ProgrammingPlanLocalStatus.extend({
            programmingSubPlanId: ProgrammingSubPlanId
          })
        )
      }),
      response: ProgrammingPlanChecked
    }
  },
  '/programming-plans/years/:year': {
    params: {
      year: z.number().int()
    },
    post: {
      permissions: ['manageProgrammingPlan'],
      response: ProgrammingPlanChecked
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
