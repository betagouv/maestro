import z from 'zod';
import { FindLaboratoryOptions } from '../schema/Laboratory/FindLaboratoryOptions';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import {
  LaboratoryAnalyticalCompetence,
  LaboratoryAnalyticalCompetenceToSave
} from '../schema/Laboratory/LaboratoryAnalyticalCompetence';
import { SubRoutes } from './routes';

export const laboratoriesRoutes = {
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
    }
} as const satisfies SubRoutes<'/laboratories'>;
