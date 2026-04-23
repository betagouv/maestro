import { z } from 'zod';
import { AnalysisDai } from '../schema/AnalysisDai/AnalysisDai';
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
      response: AnalysisDai
    }
  }
} as const satisfies SubRoutes<'/analysis-dai'>;
