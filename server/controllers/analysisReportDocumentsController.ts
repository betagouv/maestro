import { constants } from 'http2';
import { analysisReportDocumentsRepository } from '../repositories/analysisReportDocumentsRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import { SubRouter } from '../routers/routes.type';

export const analysisReportDocumentsRouter = {
  '/analysis/:analysisId/reportDocuments': {
    get: async (request) => {
      const { analysisId } = request.params;

      const analysis = await analysisRepository.findUnique(analysisId);
      if (!analysis) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      const result =
        await analysisReportDocumentsRepository.findByAnalysisId(analysisId);

      return { response: result.reverse() };
    },
    post: async (request) => {
      const { analysisId } = request.params;
      const { documentId } = request.body;

      await analysisReportDocumentsRepository.insert(analysisId, documentId);

      return {
        status: constants.HTTP_STATUS_CREATED
      };
    },
    delete: async (request) => {
      const { analysisId } = request.params;
      const { documentId } = request.body;

      await analysisReportDocumentsRepository.deleteOne(analysisId, documentId);

      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  }
} as const satisfies SubRouter;
