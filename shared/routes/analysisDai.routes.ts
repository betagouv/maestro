import { z } from 'zod';
import { PaginatedAnalysisDaiAnalyses } from '../schema/AnalysisDai/AnalysisDaiAnalysisGroup';
import { FindAnalysisDaiOptions } from '../schema/AnalysisDai/FindAnalysisDaiOptions';
import type { SubRoutes } from './routes';

export const analysisDaiRoutes = {
  '/analysis-dai': {
    get: {
      query: FindAnalysisDaiOptions,
      permissions: ['administrationMaestro'],
      response: PaginatedAnalysisDaiAnalyses
    },
    post: {
      body: z.object({ analysisId: z.guid() }),
      permissions: ['administrationMaestro'],
      response: z.undefined()
    }
  }
} as const satisfies SubRoutes<'/analysis-dai'>;
