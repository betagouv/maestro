import z from 'zod';
import { FindLaboratoryAgreementsOptions } from '../schema/Laboratory/FindLaboratoryAgreementsOptions';
import { FindLaboratoryOptions } from '../schema/Laboratory/FindLaboratoryOptions';
import {
  Laboratory,
  LaboratoryConfigUpdate,
  LaboratoryWithSacha
} from '../schema/Laboratory/Laboratory';
import {
  LaboratoryAgreement,
  LaboratoryAgreementCheckUpdate,
  LaboratoryAgreementRowKey,
  LaboratoryAgreementUpdate
} from '../schema/Laboratory/LaboratoryAgreement';
import { LaboratoryAgreementDiffusion } from '../schema/Laboratory/LaboratoryAgreementDiffusion';
import {
  LaboratoryResidueMapping,
  LaboratoryResidueMappingToUpdate
} from '../schema/Laboratory/LaboratoryResidueMapping';
import type { SubRoutes } from './routes';

export const laboratoriesRoutes = {
  '/laboratories/agreements': {
    params: undefined,
    get: {
      query: FindLaboratoryAgreementsOptions,
      response: z.array(LaboratoryAgreement),
      permissions: ['readLaboratoryAgreements', 'manageLaboratoryAgreements']
    }
  },
  '/laboratories/agreements/checks': {
    params: undefined,
    get: {
      query: FindLaboratoryAgreementsOptions,
      response: z.array(LaboratoryAgreementRowKey),
      permissions: ['manageLaboratoryAgreements']
    },
    put: {
      body: LaboratoryAgreementCheckUpdate,
      response: z.array(LaboratoryAgreementRowKey),
      permissions: ['manageLaboratoryAgreements']
    }
  },
  '/laboratories/agreements/export': {
    params: undefined,
    get: {
      query: FindLaboratoryAgreementsOptions,
      permissions: ['readLaboratoryAgreements', 'manageLaboratoryAgreements'],
      response: z.custom<Buffer>()
    }
  },
  '/laboratories/agreements/diffusions': {
    params: undefined,
    get: {
      permissions: ['readLaboratoryAgreements', 'manageLaboratoryAgreements'],
      response: z.array(LaboratoryAgreementDiffusion)
    },
    post: {
      body: z.object({ year: z.number().int() }),
      permissions: ['diffuseLaboratoryAgreements'],
      response: LaboratoryAgreementDiffusion
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
  '/laboratories/:laboratoryId/config': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      response: LaboratoryWithSacha,
      accountPermissions: ['manageLaboratoryConfig']
    },
    put: {
      body: LaboratoryConfigUpdate,
      response: z.undefined(),
      accountPermissions: ['manageLaboratoryConfig']
    }
  },
  '/laboratories/:laboratoryId/agreements': {
    params: {
      laboratoryId: z.guid()
    },
    put: {
      body: LaboratoryAgreementUpdate,
      response: z.array(LaboratoryAgreement),
      permissions: ['manageLaboratoryAgreements']
    }
  },
  '/laboratories/:laboratoryId/residue-mappings': {
    params: {
      laboratoryId: z.guid()
    },
    get: {
      response: z.array(LaboratoryResidueMapping),
      accountPermissions: ['administrationMaestro']
    },
    put: {
      body: LaboratoryResidueMappingToUpdate,
      response: LaboratoryResidueMapping,
      accountPermissions: ['administrationMaestro']
    }
  }
} as const satisfies SubRoutes<'/laboratories'>;
