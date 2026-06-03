import { HttpStatus } from '../constants/httpStatus';
import { analysisReportDocumentsRepository } from '../repositories/analysisReportDocumentsRepository';
import { analysisRepository } from '../repositories/analysisRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const analysisReportDocumentsRouter = {
  '/analysis/:analysisId/reportDocuments': {
    get: async (_request, { analysisId }) => {
      const analysis = await analysisRepository.findUnique(analysisId);
      if (!analysis) {
        return { status: HttpStatus.NOT_FOUND };
      }

      const result =
        await analysisReportDocumentsRepository.findByAnalysisId(analysisId);

      return { response: result.reverse(), status: HttpStatus.OK };
    },
    post: async (request, { analysisId }) => {
      const { documentId } = request.body;

      await analysisReportDocumentsRepository.insert(analysisId, documentId);

      return {
        status: HttpStatus.CREATED
      };
    },
    delete: async (request, { analysisId }) => {
      const { documentId } = request.body;

      await analysisReportDocumentsRepository.deleteOne(analysisId, documentId);

      return {
        status: HttpStatus.OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
