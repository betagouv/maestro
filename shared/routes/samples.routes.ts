import z from 'zod/v4';
import { PartialSample } from '../schema/Sample/Sample';
import { SubRoutes } from './routes';

export const samplesRoutes = {
  '/samples/:sampleId': {
    params: {
      sampleId: z.guid()
    },
    get: {
      permissions: ['readSamples'],
      response: PartialSample
    },
    put: {
      body: PartialSample,
      permissions: ['updateSample', 'restoreSampleToReview'],
      response: PartialSample
    },
    delete: {
      permissions: ['deleteSample'],
      response: z.void()
    }
  }
} as const satisfies SubRoutes<'/samples/:sampleId'>;
