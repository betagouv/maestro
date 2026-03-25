import { ZodObject, ZodType } from 'zod';
import { UserPermission } from '../schema/User/UserPermission';
import { analysisRoutes } from './analysis.routes';
import { authRoutes } from './auth.routes';
import { companiesRoutes } from './companies.routes';
import { documentsRoutes } from './documents.routes';
import { laboratoriesRoutes } from './laboratories.routes';
import { mascaradeRoutes } from './mascarade.routes';
import { noticesRoutes } from './notices.routes';
import { notificationsRoutes } from './notifications.routes';
import { prescriptionsRoutes } from './prescriptions.routes';
import { programmingPlansRoutes } from './programmingPlans.routes';
import { sachaCommemoratifsRoute } from './sachaCommemoratifs.route';
import { samplesRoutes } from './samples.routes';
import { specificDataFieldsRoutes } from './specificDataFields.routes';
import { usersRoutes } from './users.routes';

export const MaestroRoutes = [
  '/analysis',
  '/analysis/:analysisId',
  '/analysis/:analysisId/reportDocuments',
  '/auth',
  '/auth/role',
  '/auth/logout',
  '/auth/redirect-url',
  '/companies',
  '/documents',
  '/documents/resources',
  '/documents/upload-signed-url',
  '/documents/:documentId',
  '/documents/:documentId/download-signed-url',
  '/laboratories',
  '/laboratories/:laboratoryId',
  '/laboratories/:laboratoryId/analytical-competences',
  '/laboratories/:laboratoryId/analytical-competences/:analyticalCompetenceId',
  '/laboratories/:laboratoryId/analytical-competences/export',
  '/mascarade/:userId',
  '/mascarade',
  '/notifications',
  '/notifications/:notificationId',
  '/notices/:type',
  '/prescriptions',
  '/prescriptions/export',
  '/prescriptions/regions',
  '/prescriptions/:prescriptionId/regions/:region/comments',
  '/prescriptions/:prescriptionId/regions/:region',
  '/prescriptions/:prescriptionId/regions/:region/departments/:department/comments',
  '/prescriptions/:prescriptionId/regions/:region/departments/:department',
  '/prescriptions/:prescriptionId/regions/:region/departments/:department/companies/:companySiret',
  '/prescriptions/:prescriptionId/substances',
  '/prescriptions/:prescriptionId',
  '/programming-plans/:programmingPlanId/kinds/:kind/specific-data-fields',
  '/programming-plans',
  '/programming-plans/years/:year',
  '/programming-plans/:programmingPlanId',
  '/programming-plans/:programmingPlanId/local-status',
  '/sacha/commemoratifs',
  '/samples',
  '/samples/count',
  '/samples/export',
  '/samples/:sampleId/document',
  '/samples/:sampleId/emptyForm',
  '/samples/:sampleId/items/:itemNumber/copy/:copyNumber/document',
  '/samples/:sampleId/items/:itemNumber/copy/:copyNumber',
  '/samples/:sampleId',
  '/specific-data-fields/sacha',
  '/specific-data-fields/attribute',
  '/specific-data-fields/attribute/value',
  '/users',
  '/users/:userId'
] as const;

export const routes = {
  ...analysisRoutes,
  ...authRoutes,
  ...companiesRoutes,
  ...documentsRoutes,
  ...laboratoriesRoutes,
  ...mascaradeRoutes,
  ...noticesRoutes,
  ...notificationsRoutes,
  ...prescriptionsRoutes,
  ...programmingPlansRoutes,
  ...sachaCommemoratifsRoute,
  ...samplesRoutes,
  ...specificDataFieldsRoutes,
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
  MaestroRouteUnprotectedMethod<T> | 'params'
>;

type MaestroRouteHasUnprotectedMethod<T> = T extends MaestroRoutes
  ? MaestroRouteUnprotectedMethod<T> extends never
    ? false
    : true
  : false;

type MaestroRouteHasProtectedMethod<T> = T extends MaestroRoutes
  ? MaestroRouteProtectedMethod<T> extends never
    ? false
    : true
  : false;

export type MaestroRoutes = (typeof MaestroRoutes)[number];

export type ProtectedRoutes = {
  [K in MaestroRoutes]: MaestroRouteHasProtectedMethod<K> extends true
    ? K
    : never;
}[MaestroRoutes];

export type UnprotectedRoutes = {
  [K in MaestroRoutes]: MaestroRouteHasUnprotectedMethod<K> extends true
    ? K
    : never;
}[MaestroRoutes];

export type ToRoute = {
  query?: ZodObject;
  body?: ZodType;
  response: ZodType;
  skipSanitization?: true;
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

export type SubRoutes<T extends MaestroRoutes> = {
  [path in Extract<MaestroRoutes, `${T}${string}`>]: {
    [method in RouteMethod]?: ToRoute;
  } & {
    params?: ZodUrlParams<path>;
  };
};
