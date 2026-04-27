import type z from 'zod';
import type { ZodType } from 'zod';
import type { MaestroRoutes, routes } from './routes';

type Side = 'client' | 'server';

type InferZod<T, Mode extends 'input' | 'output'> = T extends ZodType
  ? Mode extends 'input'
    ? z.input<T>
    : z.output<T>
  : never;

// Pour body/query/params : le client envoie de l'input, le serveur reçoit de l'output.
type RequestMode<S extends Side> = S extends 'client' ? 'input' : 'output';
// Pour response : le client reçoit de l'output, le serveur retourne de l'input (parsé ensuite).
type ResponseMode<S extends Side> = S extends 'client' ? 'output' : 'input';

type RouteResponse<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P],
  S extends Side
> = (typeof routes)[P][M] extends { response: infer R }
  ? InferZod<R, ResponseMode<S>>
  : never;

type RouteBody<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P],
  S extends Side
> = (typeof routes)[P][M] extends { body: infer B }
  ? InferZod<B, RequestMode<S>>
  : never;

type RouteQuery<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P],
  S extends Side
> = (typeof routes)[P][M] extends { query: infer Q }
  ? InferZod<Q, RequestMode<S>>
  : never;

type RouteParams<
  P extends MaestroRoutes,
  S extends Side
> = (typeof routes)[P] extends { params: infer Params }
  ? Params extends undefined
    ? never
    : {
        [K in keyof Params]: Params[K] extends ZodType
          ? InferZod<Params[K], RequestMode<S>>
          : never;
      }
  : never;

export type ClientRouteResponse<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = RouteResponse<P, M, 'client'>;
export type ClientRouteBody<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = RouteBody<P, M, 'client'>;
export type ClientRouteQuery<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = RouteQuery<P, M, 'client'>;
export type ClientRouteParams<P extends MaestroRoutes> = RouteParams<
  P,
  'client'
>;

export type ServerRouteResponse<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = RouteResponse<P, M, 'server'>;
export type ServerRouteBody<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = RouteBody<P, M, 'server'>;
export type ServerRouteQuery<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = RouteQuery<P, M, 'server'>;
export type ServerRouteParams<P extends MaestroRoutes> = RouteParams<
  P,
  'server'
>;

export type OrEmpty<T> = [T] extends [never] ? Record<never, never> : T;
