import z, { AnyZodObject, ZodType } from 'zod';
import { AnalysisToCreate, PartialAnalysis } from './schema/Analysis/Analysis';
import { UserPermission } from './schema/User/UserPermission';

export type ToRoute = {
  query?: AnyZodObject;
  params?: AnyZodObject;
  body?: AnyZodObject;
  permissions: UserPermission[];
  response: ZodType;
};

export type RouteMethod = 'get' | 'post' | 'put';

export const routes = {
  '/analysis': {
    get: {
      query: z.object({ sampleId: z.string().uuid() }),
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
    put: {
      body: PartialAnalysis,
      params: z.object({
        analysisId: z.string().uuid()
      }),
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  }
} as const satisfies Record<string, { [method in RouteMethod]?: ToRoute }>;

export type MaestroRoutes = keyof typeof routes;
