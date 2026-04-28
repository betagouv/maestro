import { constants } from 'node:http2';
import { analysisDaiRepository } from '../repositories/analysisDaiRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { analysisDaiProcessor } from '../services/analysisDaiProcessor';

const { HTTP_STATUS_OK, HTTP_STATUS_CREATED, HTTP_STATUS_NOT_FOUND } =
  constants;

export const analysisDaiRouter = {
  '/analysis-dai': {
    get: async ({ query }) => {
      const result = await analysisDaiRepository.findManyGrouped(query);
      return { status: HTTP_STATUS_OK, response: result };
    },
    post: async ({ body: { analysisId } }) => {
      const analysis = await analysisRepository.findUnique(analysisId);
      if (!analysis) {
        return { status: HTTP_STATUS_NOT_FOUND };
      }
      await analysisDaiRepository.insert(analysisId);
      await analysisDaiProcessor.processPending();
      return { status: HTTP_STATUS_CREATED };
    }
  }
} as const satisfies ProtectedSubRouter;
