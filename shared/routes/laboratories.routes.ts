import z from 'zod';
import { Laboratory } from '../schema/Laboratory/Laboratory';
import { LaboratoryAnalyticalCompetence } from '../schema/Laboratory/LaboratoryAnalyticalCompetence';
import { SubRoutes } from './routes';

export const laboratoriesRoutes = {
  '/laboratories': {
    params: undefined,
    get: {
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
    }
  },
  '/laboratories/:laboratoryId/analytical-competences/:analyticalCompetenceId':
    {
      params: {
        laboratoryId: z.guid(),
        analyticalCompetenceId: z.guid()
      },
      put: {
        body: LaboratoryAnalyticalCompetence.omit({
          id: true,
          laboratoryId: true
        }),
        permissions: ['manageLaboratoryCompetences'],
        response: LaboratoryAnalyticalCompetence
      }
    }
} as const satisfies SubRoutes<'/laboratories'>;
