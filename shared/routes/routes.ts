import { ZodArray, ZodObject, ZodType } from 'zod';
import { UserPermission } from '../schema/User/UserPermission';
import { analysisRoutes } from './analysis.routes';
import { laboratoriesRoutes } from './laboratories.routes';
import { noticesRoutes } from './notices.routes';
import { notificationsRoutes } from './notifications.routes';
import { programmingPlansRoutes } from './programmingPlans.routes';
import { samplesRoutes } from './samples.routes';
import { usersRoutes } from './users.routes';

export const MaestroRoutes = [
  '/analysis',
  '/analysis/:analysisId',
  '/analysis/:analysisId/reportDocuments',
  '/laboratories',
  '/laboratories/:laboratoryId',
  '/notifications',
  '/notifications/:notificationId',
  '/notices/:type',
  '/programming-plans',
  '/programming-plans/:programmingPlanId',
  '/programming-plans/:programmingPlanId/regional-status',
  '/programming-plans/years/:year',
  '/samples',
  '/samples/count',
  '/samples/export',
  '/samples/:sampleId/document',
  '/samples/:sampleId/items/:itemNumber/document',
  '/samples/:sampleId',
  '/users',
  '/users/:userId'
] as const;

export const routes = {
  ...analysisRoutes,
  ...laboratoriesRoutes,
  ...noticesRoutes,
  ...notificationsRoutes,
  ...programmingPlansRoutes,
  ...samplesRoutes,
  ...usersRoutes
} as const satisfies {
  [path in MaestroRoutes]: { [method in RouteMethod]?: ToRoute } & {
    params?: ZodUrlParams<path>;
  };
};

type MaestroRouteMethodIsUnprotected<
  R extends MaestroRoutes,
  M extends keyof (typeof routes)[R]
> = (typeof routes)[R][M] extends { unprotected: true } ? true : false;

type PickByValue<Obj, Condition> = FromEntries<
  Extract<Entries<Obj>, [any, Condition]>
>;

type Entries<Obj> = {
  [K in keyof Obj]: [K, Obj[K]];
}[keyof Obj];

type FromEntries<Entries extends [any, any]> = {
  [Entry in Entries as Entry[0]]: Entry[1];
};

export type MaestroRouteUnprotectedMethod<T extends MaestroRoutes> =
  keyof PickByValue<
    {
      [K in keyof (typeof routes)[T]]: MaestroRouteMethodIsUnprotected<T, K>;
    },
    true
  >;

export type MaestroRouteProtectedMethod<T extends MaestroRoutes> = Exclude<
  keyof (typeof routes)[T],
  MaestroRouteUnprotectedMethod<T>
>;

type MaestroRouteHasUnprotectedMethod<T> = T extends MaestroRoutes
  ? MaestroRouteUnprotectedMethod<T> extends never
    ? false
    : true
  : false;

type MaestroRouteHasProtectedMethod<T> = T extends MaestroRoutes
  ? MaestroRouteProtectedMethod<T> extends Record<never, never>
    ? true
    : false
  : false;

type FilterProtectedRoutes<R> =
  R extends Readonly<[infer First, ...infer Rest]>
    ? MaestroRouteHasProtectedMethod<First> extends true
      ? [First, ...FilterProtectedRoutes<Rest>]
      : FilterProtectedRoutes<Rest>
    : [];

type FilterUnprotectedRoutes<R> =
  R extends Readonly<[infer First, ...infer Rest]>
    ? MaestroRouteHasUnprotectedMethod<First> extends true
      ? [First, ...FilterUnprotectedRoutes<Rest>]
      : FilterUnprotectedRoutes<Rest>
    : [];

export type MaestroRoutes = (typeof MaestroRoutes)[number];
export type ProtectedRoutes = FilterProtectedRoutes<
  typeof MaestroRoutes
>[number];
export type UnprotectedRoutes = FilterUnprotectedRoutes<
  typeof MaestroRoutes
>[number];

export type ToRoute = {
  query?: ZodObject;
  body?: ZodObject | ZodArray;
  response: ZodType;
} & (
  | {
      unprotected: true;
    }
  | { permissions: [UserPermission, ...UserPermission[]] | 'NONE' }
);

type ZodParseUrlParams<url> = url extends `${infer start}/${infer rest}`
  ? ZodParseUrlParams<start> & ZodParseUrlParams<rest>
  : url extends `:${infer param}`
    ? { [k in param]: ZodType }
    : Record<never, never>;

type ZodUrlParams<url, Z = ZodParseUrlParams<url>> = keyof Z extends never
  ? undefined
  : Z;

export type RouteMethod = 'get' | 'post' | 'put' | 'delete';

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
