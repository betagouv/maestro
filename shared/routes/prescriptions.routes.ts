import { z } from 'zod';
import { Department } from '../referential/Department';
import { Region } from '../referential/Region';
import { FindLocalPrescriptionOptions } from '../schema/LocalPrescription/FindLocalPrescriptionOptions';
import {
  LocalPrescription,
  LocalPrescriptionUpdate
} from '../schema/LocalPrescription/LocalPrescription';
import {
  LocalPrescriptionComment,
  LocalPrescriptionCommentToCreate
} from '../schema/LocalPrescription/LocalPrescriptionComment';
import { FindPrescriptionOptions } from '../schema/Prescription/FindPrescriptionOptions';
import {
  Prescription,
  PrescriptionToCreate,
  PrescriptionUpdate
} from '../schema/Prescription/Prescription';
import { PrescriptionSubstance } from '../schema/Prescription/PrescriptionSubstance';
import type { SubRoutes } from './routes';

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
      query: FindLocalPrescriptionOptions,
      permissions: ['readPrescriptions'],
      response: z.array(LocalPrescription)
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/comments': {
    params: { prescriptionId: z.guid(), region: Region },
    post: {
      body: LocalPrescriptionCommentToCreate,
      permissions: ['commentPrescription'],
      response: LocalPrescriptionComment
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/departments/:department/comments':
    {
      params: {
        prescriptionId: z.guid(),
        region: Region,
        department: Department
      },
      post: {
        body: LocalPrescriptionCommentToCreate,
        permissions: ['commentPrescription'],
        response: LocalPrescriptionComment
      }
    },
  '/prescriptions/:prescriptionId/regions/:region': {
    params: { prescriptionId: z.guid(), region: Region },
    get: {
      query: FindLocalPrescriptionOptions.pick({ includes: true }),
      permissions: ['readPrescriptions'],
      response: LocalPrescription
    },
    put: {
      body: LocalPrescriptionUpdate,
      permissions: ['updatePrescription', 'updatePrescriptionLaboratories'],
      response: LocalPrescription
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/departments/:department': {
    params: {
      prescriptionId: z.guid(),
      region: Region,
      department: Department
    },
    put: {
      body: LocalPrescriptionUpdate,
      permissions: [
        'distributePrescriptionToDepartments',
        'distributePrescriptionToSlaughterhouses',
        'updatePrescriptionLaboratories'
      ],
      response: LocalPrescription
    }
  },
  '/prescriptions/:prescriptionId/regions/:region/departments/:department/companies/:companySiret':
    {
      params: {
        prescriptionId: z.guid(),
        region: Region,
        department: Department,
        companySiret: z.string()
      },
      get: {
        query: FindLocalPrescriptionOptions.pick({ includes: true }),
        permissions: ['readPrescriptions'],
        response: LocalPrescription
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
