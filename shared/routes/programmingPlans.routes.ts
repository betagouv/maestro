import z from 'zod';
import { FindProgrammingPlanOptions } from '../schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanLocalStatus } from '../schema/ProgrammingPlan/ProgrammingPlanLocalStatus';
import {
  ProgrammingPlanSettingsForm,
  ProgrammingSubPlanSettingsForm
} from '../schema/ProgrammingPlan/ProgrammingPlanSettingsForm';
import { ProgrammingPlanStatus } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { ProgrammingPlanChecked } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingSubPlanId } from '../schema/ProgrammingPlan/ProgrammingSubPlan';
import { ProgrammingSubPlanFieldConfig } from '../schema/SpecificData/ProgrammingSubPlanFieldConfig';
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
        programmingPlanLocalStatusList: z.array(ProgrammingPlanLocalStatus)
      }),
      response: ProgrammingPlanChecked
    }
  },
  '/programming-plans/:programmingPlanId/settings': {
    params: {
      programmingPlanId: z.guid()
    },
    get: {
      permissions: ['manageProgrammingPlanSettings'],
      response: ProgrammingPlanSettingsForm
    },
    put: {
      permissions: ['manageProgrammingPlanSettings'],
      body: ProgrammingPlanSettingsForm,
      response: z.undefined()
    }
  },
  '/programming-plans/:programmingPlanId/sub-plans/:programmingSubPlanId/settings':
    {
      params: {
        programmingPlanId: z.guid(),
        programmingSubPlanId: ProgrammingSubPlanId
      },
      get: {
        permissions: ['manageProgrammingPlanSettings'],
        response: ProgrammingSubPlanSettingsForm
      },
      put: {
        permissions: ['manageProgrammingPlanSettings'],
        body: ProgrammingSubPlanSettingsForm,
        response: z.undefined()
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
      }
    }
} as const satisfies SubRoutes<'/programming-plans'>;
