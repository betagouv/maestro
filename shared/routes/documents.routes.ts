import { z } from 'zod';
import {
  AnalysisReportDocumentToCreate,
  DocumentChecked,
  DocumentToCreateChecked,
  ResourceDocumentToCreate,
  ResourceDocumentUpdate
} from '../schema/Document/Document';
import { FindDocumentOptions } from '../schema/Document/FindDocumentOptions';
import type { SubRoutes } from './routes';

export const documentsRoutes = {
  // TODO(V2) : route générique conservée uniquement pour AnalysisReportDocument.
  '/documents': {
    params: undefined,
    post: {
      response: DocumentChecked,
      body: AnalysisReportDocumentToCreate,
      permissions: ['performAnalysis']
    }
  },
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
  '/documents/resources/:documentId/download-signed-url': {
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
  '/documents/upload-signed-url': {
    params: undefined,
    post: {
      body: z.object(DocumentToCreateChecked.shape).omit({ id: true }),
      permissions: ['createResource', 'performAnalysis', 'createSample'],
      response: z.object({
        url: z.string(),
        documentId: z.string()
      })
    }
  }
} as const satisfies SubRoutes<'/documents'>;
