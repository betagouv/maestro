import { z } from 'zod';
import { AnalysisRaiId } from '../schema/AnalysisRai/AnalysisRai';
import { PaginatedAnalysisRai } from '../schema/AnalysisRai/AnalysisRaiWithRelations';
import { FindAnalysisRaiOptions } from '../schema/AnalysisRai/FindAnalysisRaiOptions';
import type { SubRoutes } from './routes';

export const analysisRaiRoutes = {
  '/analysis-rai': {
    get: {
      query: FindAnalysisRaiOptions,
      permissions: ['administrationMaestro'],
      response: PaginatedAnalysisRai
    }
  },
  '/analysis-rai/:analysisRaiId/replay': {
    params: {
      analysisRaiId: AnalysisRaiId
    },
    post: {
      permissions: ['administrationMaestro'],
      response: z.void()
    }
  }
} as const satisfies SubRoutes<'/analysis-rai'>;
