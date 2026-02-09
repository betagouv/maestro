import z from 'zod';
import {
  AnalysisToCreate,
  AnalysisToUpdate,
  PartialAnalysis
} from '../schema/Analysis/Analysis';
import { SampleItemKey } from '../schema/Sample/SampleItem';
import { SubRoutes } from './routes';

export const analysisRoutes = {
  '/analysis': {
    get: {
      query: SampleItemKey,
      permissions: ['readAnalysis'],
      response: PartialAnalysis
    },
    post: {
      body: AnalysisToCreate,
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  },
  '/analysis/:analysisId': {
    params: {
      analysisId: z.guid()
    },
    put: {
      body: AnalysisToUpdate,
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  },
  '/analysis/:analysisId/reportDocuments': {
    params: {
      analysisId: z.guid()
    },
    get: {
      permissions: ['readAnalysis'],
      response: z.array(z.guid())
    },
    post: {
      body: z.object({ documentId: z.guid() }),
      permissions: ['createAnalysis'],
      response: z.void()
    },
    delete: {
      body: z.object({ documentId: z.guid() }),
      permissions: ['createAnalysis'],
      response: z.void()
    }
  }
} as const satisfies SubRoutes<'/analysis'>;
