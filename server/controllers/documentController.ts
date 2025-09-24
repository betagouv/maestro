import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { constants } from 'http2';
import DocumentMissingError from 'maestro-shared/errors/documentMissingError';
import { Document } from 'maestro-shared/schema/Document/Document';
import { UploadDocumentKindList } from 'maestro-shared/schema/Document/DocumentKind';
import { hasPermission } from 'maestro-shared/schema/User/User';
import { documentRepository } from '../repositories/documentRepository';
import { ProtectedSubRouter } from '../routers/routes.type';
import { documentService } from '../services/documentService';
import { s3Service } from '../services/s3Service';
import config from '../utils/config';

export const documentsRouter = {
  '/documents': {
    post: async ({ body: documentToCreate, user }) => {
      if (!UploadDocumentKindList.includes(documentToCreate.kind)) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }
      if (
        documentToCreate.kind === 'Resource' &&
        !hasPermission(user, 'createResource')
      ) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }
      if (
        documentToCreate.kind === 'AnalysisReportDocument' &&
        !hasPermission(user, 'createAnalysis')
      ) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }
      if (
        documentToCreate.kind === 'SampleDocument' &&
        !hasPermission(user, 'createSample')
      ) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }

      console.log('Create document', documentToCreate);

      const document: Document = {
        ...documentToCreate,
        createdAt: new Date(),
        createdBy: user.id
      };

      await documentRepository.insert(document);

      return {
        status: constants.HTTP_STATUS_CREATED,
        response: document
      };
    }
  },
  '/documents/resources': {
    get: async () => {
      console.info('Find documents');

      const documents = await documentRepository.findMany({
        kind: 'Resource'
      });
      return {
        status: constants.HTTP_STATUS_OK,
        response: documents
      };
    }
  },
  '/documents/upload-signed-url': {
    post: async ({ user, body }) => {
      if (body.kind === 'Resource' && !hasPermission(user, 'createResource')) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }
      if (
        body.kind === 'AnalysisReportDocument' &&
        !hasPermission(user, 'createAnalysis')
      ) {
        return { status: constants.HTTP_STATUS_FORBIDDEN };
      }

      const result: { url: string; documentId: string } =
        await s3Service.getUploadSignedUrl(body.filename);

      return {
        status: constants.HTTP_STATUS_OK,
        response: result
      };
    }
  },
  '/documents/:documentId': {
    put: async ({ body: documentUpdate, user }, { documentId }) => {
      const document = await documentRepository.findUnique(documentId);

      if (
        document?.kind !== 'SampleDocument' ||
        !hasPermission(user, 'updateSample')
      ) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }

      console.log('Update document', documentId);

      const updatedDocument = {
        ...document,
        ...documentUpdate
      };

      await documentRepository.update(updatedDocument);

      return {
        status: constants.HTTP_STATUS_OK,
        response: updatedDocument
      };
    },
    delete: async ({ user }, { documentId }) => {
      const document = await documentRepository.findUnique(documentId);

      if (!document?.kind || !UploadDocumentKindList.includes(document?.kind)) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }

      if (
        document?.kind === 'Resource' &&
        !hasPermission(user, 'deleteDocument')
      ) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }
      if (
        document?.kind === 'SampleDocument' &&
        !hasPermission(user, 'deleteSampleDocument')
      ) {
        return {
          status: constants.HTTP_STATUS_FORBIDDEN
        };
      }

      console.log('Delete document', documentId);

      await documentService.deleteDocument(documentId);
      return {
        status: constants.HTTP_STATUS_NO_CONTENT
      };
    },
    get: async (_, { documentId }) => {
      console.info('Find document', documentId);

      const document = await documentRepository.findUnique(documentId);

      if (!document) {
        throw new DocumentMissingError(documentId);
      }
      return {
        status: constants.HTTP_STATUS_NO_CONTENT,
        response: document
      };
    }
  },
  '/documents/:documentId/download-signed-url': {
    get: async (_, { documentId }) => {
      console.log('Get signed url for download document', documentId);

      const document = await documentRepository.findUnique(documentId);

      if (!document) {
        throw new DocumentMissingError(documentId);
      }

      const client = s3Service.getClient();
      const key = `${documentId}_${document.filename}`;

      const command = new GetObjectCommand({
        Bucket: config.s3.bucket,
        Key: key
      });

      const url = await getS3SignedUrl(client, command, { expiresIn: 3600 });
      return {
        status: constants.HTTP_STATUS_OK,
        response: { url }
      };
    }
  }
} as const satisfies ProtectedSubRouter;
