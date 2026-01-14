import { z } from 'zod';
import {
  DocumentChecked,
  DocumentToCreateChecked,
  DocumentUpdateChecked
} from '../schema/Document/Document';
import { SubRoutes } from './routes';

export const documentsRoutes = {
  '/documents': {
    params: undefined,
    post: {
      response: DocumentChecked,
      body: DocumentToCreateChecked,
      permissions: ['createResource', 'createAnalysis', 'createSample']
    }
  },
  '/documents/:documentId': {
    params: {
      documentId: z.guid()
    },
    get: {
      permissions: ['readDocuments'],
      response: DocumentChecked
    },
    put: {
      body: DocumentUpdateChecked,
      permissions: ['createSample', 'createResource'],
      response: DocumentChecked
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
      response: z.array(DocumentChecked)
    }
  },
  '/documents/upload-signed-url': {
    params: undefined,
    post: {
      body: z.object(DocumentToCreateChecked.shape).omit({ id: true }),
      permissions: ['createResource', 'createAnalysis', 'createSample'],
      response: z.object({
        url: z.string(),
        documentId: z.string()
      })
    }
  }
} as const satisfies SubRoutes<'/documents'>;
