import z, { ZodObject, ZodType } from 'zod/v4';
import {
  AnalysisToCreate,
  AnalysisToUpdate,
  PartialAnalysis
} from './schema/Analysis/Analysis';
import { UserPermission } from './schema/User/UserPermission';

export type RouteValidator<
  key extends MaestroRoutes,
  method extends keyof (typeof routes)[key],
  Z extends keyof ToRoute
> = (typeof routes)[key][method] extends {
  [z in Z]: infer P;
}
  ? P extends ZodType
    ? z.infer<P>
    : undefined
  : undefined;

export type ToRoute = {
  query?: ZodObject;
  params?: ZodObject;
  body?: ZodObject;
  permissions: UserPermission[];
  response: ZodType;
};

export type RouteMethod = 'get' | 'post' | 'put';

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
    put: {
      body: AnalysisToUpdate,
      params: z.object({
        analysisId: z.guid()
      }),
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  }
} as const satisfies Record<string, { [method in RouteMethod]?: ToRoute }>;

export type MaestroRoutes = keyof typeof routes;
