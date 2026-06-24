import type { DocumentChecked } from 'maestro-shared/schema/Document/Document';
import { HttpStatus } from '../constants/httpStatus';
import { getAndCheckSampleDocument } from '../middlewares/checks/documentCheck';
import { getAndCheckSample } from '../middlewares/checks/sampleCheck';
import { documentRepository } from '../repositories/documentRepository';
import { executeTransaction } from '../repositories/kysely';
import { sampleRepository } from '../repositories/sampleRepository';
import type { ProtectedSubRouter } from '../routers/routes.type';
import { documentService } from '../services/documentService';
import { s3Service } from '../services/s3Service';

export const sampleDocumentsRouter = {
  '/samples/:sampleId/documents': {
    post: async ({ body: documentToCreate, user, userRole }, { sampleId }) => {
      await getAndCheckSample(sampleId, user, userRole);

      console.log('Create sample document', sampleId, documentToCreate.id);

      const document: DocumentChecked = {
        ...documentToCreate,
        kind: 'SampleDocument',
        createdAt: new Date(),
        createdBy: user.id
      };

      await executeTransaction(async (trx) => {
        await documentRepository.insert(document, trx);
        await sampleRepository.linkDocument(sampleId, document.id, trx);
      });

      const createdDocument = await documentRepository.findUnique(document.id);

      if (!createdDocument) {
        throw new Error('Document not found after insert');
      }

      return {
        status: HttpStatus.CREATED,
        response: createdDocument
      };
    }
  },
  '/samples/:sampleId/documents/:documentId': {
    get: async ({ user, userRole }, { sampleId, documentId }) => {
      console.info('Find sample document', sampleId, documentId);

      const document = await getAndCheckSampleDocument(
        sampleId,
        documentId,
        user,
        userRole
      );

      return {
        status: HttpStatus.OK,
        response: document
      };
    },
    put: async (
      { body: documentUpdate, user, userRole },
      { sampleId, documentId }
    ) => {
      const document = await getAndCheckSampleDocument(
        sampleId,
        documentId,
        user,
        userRole
      );

      const updatedDocument = { ...document, legend: documentUpdate.legend };
      await documentRepository.update(updatedDocument);

      return { status: HttpStatus.OK, response: updatedDocument };
    },
    delete: async ({ user, userRole }, { sampleId, documentId }) => {
      await getAndCheckSampleDocument(sampleId, documentId, user, userRole);

      console.log('Delete sample document', sampleId, documentId);

      await documentService.deleteDocument(documentId);
      return { status: HttpStatus.NO_CONTENT };
    }
  },
  '/samples/:sampleId/documents/:documentId/download': {
    get: async (
      { user, userRole },
      { sampleId, documentId },
      { setHeader }
    ) => {
      console.log('Redirect to download sample document', documentId);

      const document = await getAndCheckSampleDocument(
        sampleId,
        documentId,
        user,
        userRole
      );

      const url = await s3Service.getDownloadSignedUrl(
        documentId,
        document.filename
      );
      setHeader('Location', url);
      return {
        status: HttpStatus.FOUND
      };
    }
  }
} as const satisfies ProtectedSubRouter;
