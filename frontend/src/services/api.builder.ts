import type {
  MutationDefinition,
  QueryDefinition
} from '@reduxjs/toolkit/query';
import type { MaestroRoutes } from 'maestro-shared/routes/routes';
import { routes } from 'maestro-shared/routes/routes';
import type {
  OrEmpty,
  RouteBody,
  RouteParams,
  RouteQuery,
  RouteResponse
} from 'maestro-shared/routes/routes.infer';
import type { TagType } from './api.service';

// Combined arg = URL params merged with body fields and query string params
type RouteArg<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = OrEmpty<RouteParams<P>> &
  OrEmpty<RouteBody<P, M>> &
  OrEmpty<RouteQuery<P, M>>;

type FinalArg<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
  // biome-ignore lint/suspicious/noConfusingVoidType: Use void when arg has no required fields (allows calling hooks with no argument)
> = keyof RouteArg<P, M> extends never ? void : RouteArg<P, M>;

type RouteWithGet = {
  [P in MaestroRoutes]: 'get' extends keyof (typeof routes)[P] ? P : never;
}[MaestroRoutes];

type MutationMethods<P extends MaestroRoutes> = Extract<
  keyof (typeof routes)[P],
  'post' | 'put' | 'delete'
>;

type TypedBuilder = {
  query<R, A>(def: {
    query: (arg: A) => unknown;
    [k: string]: unknown;
  }): QueryDefinition<A, any, string, R>;
  mutation<R, A>(def: {
    query: (arg: A) => unknown;
    [k: string]: unknown;
  }): MutationDefinition<A, any, string, R>;
};

type Tags = TagType | { type: TagType; id?: string | number };

type QueryOptions<Response, Arg> = {
  providesTags?:
    | Tags[]
    | ((result: Response | undefined, error: unknown, arg: Arg) => Tags[]);
  transformResponse?: (response: Response) => unknown;
  [k: string]: unknown;
};

type MutationOptions<Response, Arg> = {
  invalidatesTags?:
    | Tags[]
    | ((result: Response | undefined, error: unknown, arg: Arg) => Tags[]);
  [k: string]: unknown;
};

function buildUrl(path: string, arg: Record<string, unknown>): string {
  return path.replace(/:([^/]+)/g, (_, param) => String(arg[param] ?? ''));
}

// --- Typed wrappers ---

/**
 * Creates a typed RTK Query `query` endpoint (GET) from a shared route definition.
 * Arg type and response type are automatically inferred from the route schema.
 */
export function buildTypedQuery<P extends RouteWithGet>(
  builder: any,
  path: P,
  options?: QueryOptions<RouteResponse<P, 'get'>, FinalArg<P, 'get'>>,
  ..._check: keyof OrEmpty<RouteParams<P>> &
    keyof OrEmpty<RouteQuery<P, 'get'>> extends never
    ? []
    : [
        'Error: key overlap between params and query — remove shared keys from query schema'
      ]
): QueryDefinition<FinalArg<P, 'get'>, any, string, RouteResponse<P, 'get'>> {
  return (builder as TypedBuilder).query<
    RouteResponse<P, 'get'>,
    FinalArg<P, 'get'>
  >({
    query: (arg: FinalArg<P, 'get'>) => {
      const argRecord = (arg as unknown as Record<string, unknown>) ?? {};
      const paramKeys = new Set(
        Array.from(path.matchAll(/:([^/]+)/g), (m) => m[1])
      );
      const queryParams = Object.fromEntries(
        Object.entries(argRecord).filter(([k]) => !paramKeys.has(k))
      );
      return {
        url: buildUrl(path, argRecord),
        ...(Object.keys(queryParams).length > 0 ? { params: queryParams } : {})
      };
    },
    ...(options ?? {})
  });
}

/**
 * Creates a typed RTK Query `mutation` endpoint (POST/PUT/DELETE) from a shared route definition.
 * Arg type and response type are automatically inferred from the route schema.
 * URL params are interpolated from the arg; remaining fields are sent as the request body.
 */
export function buildTypedMutation<
  P extends MaestroRoutes,
  M extends MutationMethods<P>
>(
  builder: any,
  path: P,
  method: M,
  options?: MutationOptions<RouteResponse<P, M>, FinalArg<P, M>>,
  ..._check: keyof OrEmpty<RouteParams<P>> &
    (
      | keyof OrEmpty<RouteBody<P, M>>
      | keyof OrEmpty<RouteQuery<P, M>>
    ) extends never
    ? keyof OrEmpty<RouteBody<P, M>> &
        keyof OrEmpty<RouteQuery<P, M>> extends never
      ? []
      : [
          'Error: key overlap between body and query — remove shared keys from body or query schema'
        ]
    : [
        'Error: key overlap between params and body/query — remove shared keys from body or query schema'
      ]
): MutationDefinition<FinalArg<P, M>, any, string, RouteResponse<P, M>> {
  return (builder as TypedBuilder).mutation<
    RouteResponse<P, M>,
    FinalArg<P, M>
  >({
    query: (arg: FinalArg<P, M>) => {
      const argRecord = (arg as unknown as Record<string, unknown>) ?? {};
      const paramKeys = new Set(
        Array.from(path.matchAll(/:([^/]+)/g), (m) => m[1])
      );
      const routeDef = (routes as any)[path]?.[method as string];
      const queryShape = routeDef?.query?.shape as
        | Record<string, unknown>
        | undefined;
      const queryKeys = queryShape
        ? new Set(Object.keys(queryShape))
        : new Set<string>();
      const queryParams = Object.fromEntries(
        Object.entries(argRecord).filter(([k]) => queryKeys.has(k))
      );
      const bodyFields = Object.fromEntries(
        Object.entries(argRecord).filter(
          ([k]) => !paramKeys.has(k) && !queryKeys.has(k)
        )
      );
      return {
        url: buildUrl(path, argRecord),
        method: method.toUpperCase(),
        ...(Object.keys(queryParams).length > 0 ? { params: queryParams } : {}),
        ...(Object.keys(bodyFields).length > 0 ? { body: bodyFields } : {})
      };
    },
    ...(options ?? {})
  });
}
