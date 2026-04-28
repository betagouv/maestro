import type z from 'zod';
import type { ZodType } from 'zod';
import type { MaestroRoutes, routes } from './routes';

export type InferZod<T> = T extends ZodType ? z.infer<T> : never;

export type RouteResponse<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = (typeof routes)[P][M] extends { response: infer R } ? InferZod<R> : never;

export type RouteBody<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = (typeof routes)[P][M] extends { body: infer B } ? InferZod<B> : never;

export type RouteQuery<
  P extends MaestroRoutes,
  M extends keyof (typeof routes)[P]
> = (typeof routes)[P][M] extends { query: infer Q } ? InferZod<Q> : never;

export type RouteParams<P extends MaestroRoutes> = (typeof routes)[P] extends {
  params: infer Params;
}
  ? Params extends undefined
    ? never
    : {
        [K in keyof Params]: Params[K] extends ZodType
          ? z.infer<Params[K]>
          : never;
      }
  : never;

export type OrEmpty<T> = [T] extends [never] ? Record<never, never> : T;
