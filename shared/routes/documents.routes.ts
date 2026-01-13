import { z } from 'zod';
import {
  Document,
  DocumentToCreate,
  DocumentUpdate
} from '../schema/Document/Document';
import { SubRoutes } from './routes';

export const documentsRoutes = {
  '/documents': {
    params: undefined,
    post: {
      response: Document,
      body: DocumentToCreate,
      permissions: ['createResource', 'createAnalysis', 'createSample']
    }
  },
  '/documents/:documentId': {
    params: {
      documentId: z.guid()
    },
    get: {
      permissions: ['readDocuments'],
      response: Document
    },
    put: {
      body: DocumentUpdate,
      permissions: ['createSample', 'createResource'],
      response: Document
    },
    delete: {
      permissions: ['deleteDocument', 'deleteSampleDocument'],
      response: z.void()
    }
  },
  '/documents/:documentId/download-signed-url': {
    params: {
      documentId: z.guid()
    },
    get: {
      permissions: ['readDocuments'],
      response: z.object({
        url: z.string()
      })
    }
  },
  '/documents/resources': {
    params: undefined,
    get: {
      permissions: ['readDocuments'],
      response: z.array(Document)
    }
  },
  '/documents/upload-signed-url': {
    params: undefined,
    post: {
      body: z.object(DocumentToCreate.shape).omit({ id: true }),
      permissions: ['createResource', 'createAnalysis', 'createSample'],
      response: z.object({
        url: z.string(),
        documentId: z.string()
      })
    }
  }
} as const satisfies SubRoutes<'/documents'>;
