import { constants } from 'http2';
import { analysisReportDocumentsRepository } from '../repositories/analysisReportDocumentsRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import { SubRouter } from '../routers/routes.type';

export const analysisReportDocumentsRouter = {
  '/analysis/:analysisId/reportDocuments': {
    get: async (_request, { analysisId }) => {
      const analysis = await analysisRepository.findUnique(analysisId);
      if (!analysis) {
        return { status: constants.HTTP_STATUS_NOT_FOUND };
      }

      const result =
        await analysisReportDocumentsRepository.findByAnalysisId(analysisId);

      return { response: result.reverse() };
    },
    //FIXME pas de user
    post: async (request, { analysisId }) => {
      const { documentId } = request.body;

      await analysisReportDocumentsRepository.insert(analysisId, documentId);

      return {
        status: constants.HTTP_STATUS_CREATED
      };
    },
    //FIXME pas de user
    delete: async (request, { analysisId }) => {
      const { documentId } = request.body;

      await analysisReportDocumentsRepository.deleteOne(analysisId, documentId);

      return {
        status: constants.HTTP_STATUS_OK
      };
    }
  }
} as const satisfies SubRouter;
