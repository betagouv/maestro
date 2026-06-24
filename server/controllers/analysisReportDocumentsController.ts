import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckAnalysisSample } from '../middlewares/checks/analysisCheck';
import { analysisReportDocumentsRepository } from '../repositories/analysisReportDocumentsRepository';
import { documentRepository } from '../repositories/documentRepository';
import { executeTransaction } from '../repositories/kysely';
import type { ProtectedSubRouter } from '../routers/routes.type';

export const analysisReportDocumentsRouter = {
  '/analysis/:analysisId/reportDocuments': {
    get: async ({ user, userRole }, { analysisId }) => {
      await getAndCheckAnalysisSample(analysisId, user, userRole, false);

      const result =
        await analysisReportDocumentsRepository.findByAnalysisId(analysisId);

      return { response: result.reverse(), status: HttpStatus.OK };
    },
    post: async (
      { body: documentToCreate, user, userRole },
      { analysisId }
    ) => {
      await getAndCheckAnalysisSample(analysisId, user, userRole, true);

      console.log(
        'Create analysis report document',
        analysisId,
        documentToCreate.id
      );

      const document: DocumentChecked = {
        ...documentToCreate,
        createdAt: new Date(),
        createdBy: user.id
      };

      await executeTransaction(async (trx) => {
        await documentRepository.insert(document, trx);
        await analysisReportDocumentsRepository.insert(
          analysisId,
          document.id,
          trx
        );
      });

      return {
        status: HttpStatus.CREATED
      };
    },
    delete: async ({ body, user, userRole }, { analysisId }) => {
      await getAndCheckAnalysisSample(analysisId, user, userRole, true);

      await analysisReportDocumentsRepository.deleteOne(
        analysisId,
        body.documentId
      );

      return {
        status: HttpStatus.OK
      };
    }
  }
} as const satisfies ProtectedSubRouter;
