import { ZodObject, ZodType } from 'zod/v4';
import { UserPermission } from '../schema/User/UserPermission';
import { analysisRoutes } from './analysis.routes';
import { programmingPlansRoutes } from './programmingPlans.routes';

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

export type ZodUrlParams<
  url,
  Z = ZodParseUrlParams<url>
> = keyof Z extends never ? undefined : Z;

export type RouteMethod = 'get' | 'post' | 'put' | 'delete';

export const MaestroRoutes = [
  '/analysis',
  '/analysis/:analysisId',
  '/analysis/:analysisId/reportDocuments',
  '/programming-plans',
  '/programming-plans/:programmingPlanId',
  '/programming-plans/years/:year'
] as const;

export type MaestroRoutes = (typeof MaestroRoutes)[number];

type FilterRoute<D extends string, R = typeof MaestroRoutes> =
  R extends Readonly<[infer First, ...infer Rest]>
    ? First extends `${D}${string}`
      ? [First, ...FilterRoute<D, Rest>]
      : FilterRoute<D, Rest>
    : [];

export type SubRoutes<T extends MaestroRoutes> = {
  [path in FilterRoute<T>[number]]: { [method in RouteMethod]?: ToRoute } & {
    params?: ZodUrlParams<path>;
  };
};

export const routes = {
  ...analysisRoutes,
  ...programmingPlansRoutes
} as const satisfies {
  [path in MaestroRoutes]: { [method in RouteMethod]?: ToRoute } & {
    params?: ZodUrlParams<path>;
  };
};
