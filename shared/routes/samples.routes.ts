import z from 'zod/v4';
import { FindSampleOptions } from '../schema/Sample/FindSampleOptions';
import { PartialSample, PartialSampleToCreate } from '../schema/Sample/Sample';
import { SubRoutes } from './routes';

export const samplesRoutes = {
  '/samples': {
    get: {
      query: FindSampleOptions,
      permissions: ['readSamples'],
      response: z.array(PartialSample)
    },
    post: {
      body: PartialSampleToCreate,
      permissions: ['createSample'],
      response: PartialSample
    }
  },
  '/samples/count': {
    get: {
      query: FindSampleOptions,
      permissions: ['readSamples'],
      response: z.object({ count: z.number() })
    }
  },
  '/samples/export': {
    get: {
      query: FindSampleOptions,
      permissions: ['readSamples'],
      response: z.custom<Buffer>()
    }
  },
  '/samples/:sampleId/document': {
    params: {
      sampleId: z.guid()
    },
    get: {
      permissions: ['downloadSupportDocument'],
      response: z.custom<Buffer>()
    }
  },
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
} as const satisfies SubRoutes<'/samples'>;
