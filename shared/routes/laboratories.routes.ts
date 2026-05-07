import z from 'zod';
import { FindLaboratoryOptions } from '../schema/Laboratory/FindLaboratoryOptions';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import {
  LaboratoryAgreement,
  LaboratoryAgreementUpdate
} from '../schema/Laboratory/LaboratoryAgreement';
import {
  LaboratoryAnalyticalCompetence,
  LaboratoryAnalyticalCompetenceToSave
} from '../schema/Laboratory/LaboratoryAnalyticalCompetence';
import type { SubRoutes } from './routes';

export const laboratoriesRoutes = {
  '/laboratories/agreements': {
    params: undefined,
    get: {
      response: z.array(LaboratoryAgreement),
      permissions: ['manageLaboratoryAgreements'] as const
    }
  },
  '/laboratories': {
    params: undefined,
    get: {
      query: FindLaboratoryOptions,
      response: z.array(Laboratory),
      permissions: 'NONE'
    }
  },
  '/laboratories/:laboratoryId': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      response: Laboratory,
      permissions: 'NONE'
    }
  },
  '/laboratories/:laboratoryId/agreements': {
    params: {
      laboratoryId: z.guid()
    },
    put: {
      body: LaboratoryAgreementUpdate,
      response: z.array(LaboratoryAgreement),
      permissions: ['manageLaboratoryAgreements'] as const
    }
  },
  '/laboratories/:laboratoryId/analytical-competences': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      response: z.array(LaboratoryAnalyticalCompetence),
      permissions: ['readLaboratoryCompetences']
    },
    post: {
      body: LaboratoryAnalyticalCompetenceToSave,
      response: z.array(LaboratoryAnalyticalCompetence),
      permissions: ['manageLaboratoryCompetences']
    }
  },
  '/laboratories/:laboratoryId/analytical-competences/:analyticalCompetenceId':
    {
      params: {
        laboratoryId: z.guid(),
        analyticalCompetenceId: z.guid()
      },
      put: {
        body: LaboratoryAnalyticalCompetenceToSave,
        permissions: ['manageLaboratoryCompetences'],
        response: z.array(LaboratoryAnalyticalCompetence)
      }
    },
  '/laboratories/:laboratoryId/analytical-competences/export': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      permissions: ['readLaboratoryCompetences'],
      response: z.custom<Buffer>()
    }
  }
} as const satisfies SubRoutes<'/laboratories'>;
