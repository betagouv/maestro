import { z } from 'zod';
import {
  DocumentBase,
  DocumentChecked,
  ResourceDocumentToCreate,
  ResourceDocumentUpdate
} from '../schema/Document/Document';
import { FindDocumentOptions } from '../schema/Document/FindDocumentOptions';
import type { SubRoutes } from './routes';

export const documentsRoutes = {
  '/documents/resources': {
    params: undefined,
    get: {
      query: FindDocumentOptions,
      permissions: ['readDocuments'],
      response: z.array(DocumentChecked)
    },
    post: {
      response: DocumentChecked,
      body: ResourceDocumentToCreate,
      permissions: ['createResource']
    }
  },
  '/documents/resources/:documentId': {
    params: {
      documentId: z.guid()
    },
    get: {
      permissions: ['readDocuments'],
      response: DocumentChecked
    },
    put: {
      body: ResourceDocumentUpdate,
      permissions: ['createResource'],
      response: DocumentChecked
    },
    delete: {
      permissions: ['deleteDocument'],
      response: z.undefined()
    }
  },
  '/documents/resources/:documentId/download': {
    params: {
      documentId: z.guid()
    },
    get: {
      permissions: ['readDocuments'],
      response: z.undefined()
    }
  },
  '/documents/upload-signed-url': {
    params: undefined,
    post: {
      body: DocumentBase.pick({ filename: true }),
      permissions: ['createResource', 'performAnalysis', 'createSample'],
      response: z.object({
        url: z.string(),
        documentId: z.string()
      })
    }
  }
} as const satisfies SubRoutes<
  '/documents/resources' | '/documents/upload-signed-url'
>;
