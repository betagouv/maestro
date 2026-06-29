import type { Region } from '../../referential/Region';
import { serializeQuery } from '../../utils/url';
import type { ProgrammingPlanContext } from '../ProgrammingPlan/Context';
import type { FindSampleOptions } from '../Sample/FindSampleOptions';

const appRoutePaths = {
  DashboardRoute: '/',
  NotificationsRoute: '/notifications',
  ProgrammingRoute: '/programmation',
  ProgrammingByYearRoute: '/programmation/:year',
  SamplesByYearRoute: '/programmation/:year/prelevements',
  NewSampleRoute: '/programmation/:year/prelevements/nouveau',
  SampleRoute: '/prelevements/:sampleId',
  SampleAnalysisEditRoute: '/prelevements/:sampleId/edit',
  NewDocumentRoute: '/documents/nouveau',
  DocumentRoute: '/documents/:documentId',
  DocumentsRoute: '/documents',
  LoginRoute: '/',
  LoginCallbackRoute: '/login-callback',
  LogoutCallbackRoute: '/logout-callback',
  AdminRoute: '/admin/:section/:itemId?',
  UsersRoute: '/utilisateurs',
  LaboratoryAnalyticalCompetencesRoute: '/competences-analytiques',
  LaboratoryAgreementsRoute: '/laboratoires/agrements'
} as const;

export type AppRouteKeys = keyof typeof appRoutePaths;

type AppRouteSearchParams = {
  SamplesByYearRoute: Partial<
    Pick<
      FindSampleOptions,
      | 'programmingPlanIds'
      | 'matrixKinds'
      | 'regions'
      | 'contexts'
      | 'statuses'
      | 'sampledBy'
    >
  >;
  ProgrammingRoute: {
    year?: number;
    planIds?: string;
    context?: ProgrammingPlanContext;
    prescriptionId?: string;
    commentsRegion?: Region;
  };
  DocumentsRoute: {
    documentId?: string;
  };
};

type Split<S extends string> = S extends `${infer Head}/${infer Tail}`
  ? [Head, ...Split<Tail>]
  : [S];

type ParamsOf<Segments extends string[]> = Segments extends [
  infer Head extends string,
  ...infer Tail extends string[]
]
  ? Head extends `:${infer Name}`
    ? Name extends `${string}?`
      ? [param?: string | number, ...ParamsOf<Tail>]
      : [param: string | number, ...ParamsOf<Tail>]
    : ParamsOf<Tail>
  : [];

type QueryArg<K extends AppRouteKeys> = K extends keyof AppRouteSearchParams
  ? [query?: AppRouteSearchParams[K]]
  : [];

// `link` is always a function: path params first, then an optional typed query.
type RouteLink<K extends AppRouteKeys> = (
  ...args: [...ParamsOf<Split<(typeof appRoutePaths)[K]>>, ...QueryArg<K>]
) => string;

const buildRouteLink =
  (path: string) =>
  (...args: unknown[]): string => {
    const query = args.find((arg) => arg !== null && typeof arg === 'object') as
      | Record<string, unknown>
      | undefined;
    const pathArgs = args.filter(
      (arg) => arg === null || typeof arg !== 'object'
    );
    let index = 0;
    const url = path
      .split('/')
      .map((segment) => {
        if (!segment.startsWith(':')) {
          return segment;
        }
        const value = pathArgs[index++];
        // Drop the whole segment when an optional param is omitted.
        if (value === undefined || value === null) {
          return segment.endsWith('?') ? undefined : '';
        }
        return String(value);
      })
      .filter((segment) => segment !== undefined)
      .join('/');
    return query ? `${url}${serializeQuery(query)}` : url;
  };

type AppRouteLinksType = {
  [K in AppRouteKeys]: {
    path: (typeof appRoutePaths)[K];
    link: RouteLink<K>;
  };
};

export const AppRouteLinks = Object.fromEntries(
  Object.entries(appRoutePaths).map(([key, path]) => [
    key,
    { path, link: buildRouteLink(path) }
  ])
) as unknown as AppRouteLinksType;
