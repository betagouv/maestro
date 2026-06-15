import { HttpStatus } from '../constants/httpStatus';
import { analysisDaiRepository } from '../repositories/analysisDaiRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { analysisDaiProcessor } from '../services/analysisDaiProcessor';

export const analysisDaiRouter = {
  '/analysis-dai': {
    get: async ({ query }) => {
      const result = await analysisDaiRepository.findManyGrouped(query);
      return { status: HttpStatus.OK, response: result };
    },
    post: async ({ body: { analysisId } }) => {
      const analysis = await analysisRepository.findUnique(analysisId);
      if (!analysis) {
        return { status: HttpStatus.NOT_FOUND };
      }
      await analysisDaiRepository.insert(analysisId);
      await analysisDaiProcessor.processPending();
      return { status: HttpStatus.CREATED };
    }
  },
  '/analysis-dai/:analysisDaiId/mark-error': {
    post: async ({ body: { message } }, { analysisDaiId }) => {
      const updatedCount = await analysisDaiRepository.markAsError(
        analysisDaiId,
        message
      );
      if (updatedCount === 0) {
        return { status: HttpStatus.NOT_FOUND };
      }
      return { status: HttpStatus.NO_CONTENT };
    }
  }
} as const satisfies ProtectedSubRouter;
