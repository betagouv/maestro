import z, { ZodObject, ZodType } from 'zod/v4';
import {
  AnalysisToCreate,
  AnalysisToUpdate,
  PartialAnalysis
} from './schema/Analysis/Analysis';
import { UserPermission } from './schema/User/UserPermission';

export type ToRoute = {
  query?: ZodObject;
  body?: ZodObject;
  permissions: UserPermission[];
  response: ZodType;
};

export type RouteMethod = 'get' | 'post' | 'put' | 'delete';

export const routes = {
  '/analysis': {
    get: {
      query: z.object({ sampleId: z.guid() }),
      permissions: ['readAnalysis'],
      response: PartialAnalysis
    },
    post: {
      body: AnalysisToCreate,
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  },
  '/analysis/:analysisId': {
    params: z.object({
      analysisId: z.guid()
    }),
    put: {
      body: AnalysisToUpdate,
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  },
  '/analysis/:analysisId/reportDocuments': {
    params: z.object({
      analysisId: z.guid()
    }),
    get: {
      permissions: ['readAnalysis'],
      response: z.array(z.guid())
    },
    post: {
      body: z.object({ documentId: z.guid() }),
      permissions: ['createAnalysis'],
      response: z.void()
    },
    delete: {
      body: z.object({ documentId: z.guid() }),
      permissions: ['createAnalysis'],
      response: z.void()
    }
  }
} as const satisfies Record<
  string,
  { [method in RouteMethod]?: ToRoute } & {
    params?: ZodObject;
  }
>;

export type MaestroRoutes = keyof typeof routes;
