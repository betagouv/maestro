import { z } from 'zod';
import { FindPrescriptionOptions } from '../schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionToCreate,
  PrescriptionUpdate
} from '../schema/Prescription/Prescription';
import { PrescriptionSubstance } from '../schema/Prescription/PrescriptionSubstance';
import { FindRegionalPrescriptionOptions } from '../schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  RegionalPrescription,
  RegionalPrescriptionUpdate
} from '../schema/RegionalPrescription/RegionalPrescription';
import {
  RegionalPrescriptionComment,
  RegionalPrescriptionCommentToCreate
} from '../schema/RegionalPrescription/RegionalPrescriptionComment';
import { RegionalPrescriptionKey } from '../schema/RegionalPrescription/RegionalPrescriptionKey';
import { SubRoutes } from './routes';

export const prescriptionsRoutes = {
  '/prescriptions': {
    params: undefined,
    get: {
      query: FindPrescriptionOptions,
      response: z.array(Prescription),
      permissions: ['readPrescriptions']
    },
    post: {
      body: PrescriptionToCreate,
      permissions: ['createPrescription'],
      response: Prescription
    }
  },
  '/prescriptions/export': {
    params: undefined,
    get: {
      query: FindPrescriptionOptions.omit({ includes: true }),
      permissions: ['readPrescriptions'],
      response: z.custom<Buffer>()
    }
  },
  '/prescriptions/regions': {
    params: undefined,
    get: {
      query: FindRegionalPrescriptionOptions,
      permissions: ['readPrescriptions'],
      response: z.array(RegionalPrescription)
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/comments': {
    params: RegionalPrescriptionKey.shape,
    post: {
      body: RegionalPrescriptionCommentToCreate,
      permissions: ['commentPrescription'],
      response: RegionalPrescriptionComment
    }
  },
  '/prescriptions/:prescriptionId/regions/:region': {
    params: RegionalPrescriptionKey.shape,
    put: {
      body: RegionalPrescriptionUpdate,
      permissions: ['updatePrescription', 'updatePrescriptionLaboratory'],
      response: RegionalPrescription
    }
  },
  '/prescriptions/:prescriptionId': {
    params: {
      prescriptionId: z.guid()
    },
    put: {
      body: PrescriptionUpdate,
      permissions: ['updatePrescription'],
      response: Prescription
    },
    delete: {
      permissions: ['deletePrescription'],
      response: z.void()
    }
  },
  '/prescriptions/:prescriptionId/substances': {
    params: {
      prescriptionId: z.guid()
    },
    get: {
      permissions: ['readPrescriptions'],
      response: z.array(PrescriptionSubstance)
    }
  }
} as const satisfies SubRoutes<'/prescriptions'>;
