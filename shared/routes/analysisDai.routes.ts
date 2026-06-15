import { z } from 'zod';
import { AnalysisDaiId } from '../schema/AnalysisDai/AnalysisDai';
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
  },
  '/analysis-dai/:analysisDaiId/mark-error': {
    params: {
      analysisDaiId: AnalysisDaiId
    },
    post: {
      body: z.object({ message: z.string().trim().min(1) }),
      permissions: ['administrationMaestro'],
      response: z.undefined()
    }
  }
} as const satisfies SubRoutes<'/analysis-dai'>;
