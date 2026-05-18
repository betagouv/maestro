import z from 'zod';
import { FindLaboratoryOptions } from '../schema/Laboratory/FindLaboratoryOptions';
import {
  Laboratory,
  LaboratoryConfigUpdate,
  LaboratoryWithSacha
} from '../schema/Laboratory/Laboratory';
import {
  LaboratoryAnalyticalCompetence,
  LaboratoryAnalyticalCompetenceToSave
} from '../schema/Laboratory/LaboratoryAnalyticalCompetence';
import {
  LaboratoryResidueMapping,
  LaboratoryResidueMappingToUpdate
} from '../schema/Laboratory/LaboratoryResidueMapping';
import type { SubRoutes } from './routes';

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
  '/laboratories/:laboratoryId/config': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      response: LaboratoryWithSacha,
      permissions: ['administrationMaestro']
    },
    put: {
      body: LaboratoryConfigUpdate,
      response: z.void(),
      permissions: ['administrationMaestro']
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
  },
  '/laboratories/:laboratoryId/residue-mappings': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      response: z.array(LaboratoryResidueMapping),
      permissions: ['administrationMaestro']
    },
    put: {
      body: LaboratoryResidueMappingToUpdate,
      response: LaboratoryResidueMapping,
      permissions: ['administrationMaestro']
    }
  },
  '/laboratories/:laboratoryId/residue-mappings/orphan-labels': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      response: z.array(z.string()),
      permissions: ['administrationMaestro']
    }
  }
} as const satisfies SubRoutes<'/laboratories'>;
