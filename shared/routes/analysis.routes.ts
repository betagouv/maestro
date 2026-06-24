import z from 'zod';
import {
  AnalysisToCreate,
  AnalysisToUpdate,
  PartialAnalysis
} from '../schema/Analysis/Analysis';
import { AnalysisReportDocumentToCreate } from '../schema/Document/Document';
import { SampleItemKey } from '../schema/Sample/SampleItem';
import { analysisDaiRoutes } from './analysisDai.routes';
import { analysisRaiRoutes } from './analysisRai.routes';
import type { SubRoutes } from './routes';

export const analysisRoutes = {
  ...analysisDaiRoutes,
  ...analysisRaiRoutes,
  '/analysis': {
    get: {
      query: SampleItemKey,
      permissions: ['readAnalysis'],
      response: PartialAnalysis
    },
    post: {
      body: AnalysisToCreate,
      permissions: ['performAnalysis'],
      response: PartialAnalysis
    }
  },
  '/analysis/:analysisId': {
    params: {
      analysisId: z.guid()
    },
    put: {
      body: AnalysisToUpdate,
      permissions: ['performAnalysis'],
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
      body: AnalysisReportDocumentToCreate,
      permissions: ['performAnalysis'],
      response: z.undefined()
    },
    delete: {
      body: z.object({ documentId: z.guid() }),
      permissions: ['performAnalysis'],
      response: z.undefined()
    }
  }
} as const satisfies SubRoutes<'/analysis'>;
