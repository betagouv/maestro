import type { MaestroRoutes, routes } from 'maestro-shared/routes/routes';
import type {
  OrEmpty,
  RouteParams,
  RouteQuery
} from 'maestro-shared/routes/routes.infer';
import { serializeQuery } from 'maestro-shared/utils/url';
import { generatePath } from 'react-router';
import config from './config';

type RouteWithGet = {
  [P in MaestroRoutes]: 'get' extends keyof (typeof routes)[P] ? P : never;
}[MaestroRoutes];

type QueryParamValue =
  | string
  | number
  | boolean
  | readonly (string | number)[]
  | null
  | undefined;

export const getURLQuery = <P extends RouteWithGet = never>(
  params: [P] extends [never]
    ? Record<string, QueryParamValue>
    : Partial<RouteQuery<P, 'get'>>
): string => serializeQuery(params as Record<string, unknown>);

type GetApiUrlArg<P extends RouteWithGet> = OrEmpty<RouteParams<P>> &
  OrEmpty<RouteQuery<P, 'get'>>;

export const getApiUrl = <P extends RouteWithGet>(
  path: P,
  // biome-ignore lint/suspicious/noConfusingVoidType: void when the route has no params nor query
  arg: keyof GetApiUrlArg<P> extends never ? void : GetApiUrlArg<P>
): string => {
  const argRecord = (arg as Record<string, string | null | undefined>) ?? {};
  const paramKeys = new Set(
    Array.from(path.matchAll(/:([^/]+)/g), (m) => m[1])
  );
  const url = generatePath<string>(path, argRecord);
  const query = Object.fromEntries(
    Object.entries(argRecord).filter(([k]) => !paramKeys.has(k))
  );
  return `${config.apiEndpoint}/api${url}${serializeQuery(query)}`;
};
