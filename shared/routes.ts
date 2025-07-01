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

type ZodParseUrlParams<url> = url extends `${infer start}/${infer rest}`
  ? ZodParseUrlParams<start> & ZodParseUrlParams<rest>
  : url extends `:${infer param}`
    ? { [k in param]: ZodType }
    : Record<never, never>;

type ZodUrlParams<url, Z = ZodParseUrlParams<url>> = keyof Z extends never
  ? undefined
  : Z;

export type RouteMethod = 'get' | 'post' | 'put' | 'delete';

export type MaestroRoutes =
  | '/analysis'
  | '/analysis/:analysisId'
  | '/analysis/:analysisId/reportDocuments';

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
    params: {
      analysisId: z.guid()
    },
    put: {
      body: AnalysisToUpdate,
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  },
  '/analysis/:analysisId/reportDocuments': {
    params: {
      analysisId: z.guid()
    },
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
} as const satisfies {
  [path in MaestroRoutes]: { [method in RouteMethod]?: ToRoute } & {
    params?: ZodUrlParams<path>;
  };
};
