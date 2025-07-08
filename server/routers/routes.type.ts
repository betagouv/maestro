import express, { Request, Response } from 'express';
import { constants } from 'http2';
import {
  MaestroRouteProtectedMethod,
  MaestroRoutes,
  MaestroRouteUnprotectedMethod,
  ProtectedRoutes,
  RouteMethod,
  routes,
  ToRoute,
  UnprotectedRoutes
} from 'maestro-shared/routes/routes';
import { User } from 'maestro-shared/schema/User/User';
import z, { ZodObject, ZodRawShape, ZodType } from 'zod/v4';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, query } from '../middlewares/validator';

type MaestroResponse<
  key extends MaestroRoutes,
  method extends keyof (typeof routes)[key],
  ResponseValidator = RouteValidator<key, method, 'response'>
> = ResponseValidator extends undefined ? void : ResponseValidator;

type RouteValidator<
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

type ResponseMethods = Pick<Response, 'setHeader' | 'clearCookie'>;
type MaestroRouteMethod<
  key extends MaestroRoutes,
  method extends keyof (typeof routes)[key],
  IsProtected extends boolean
> = (
  request: Request<
    undefined,
    undefined,
    RouteValidator<key, method, 'body'>,
    RouteValidator<key, method, 'query'>
  > &
    (IsProtected extends true
      ? {
          user: User;
        }
      : Record<never, never>),
  params: (typeof routes)[key] extends {
    params: infer P;
  }
    ? P extends ZodRawShape
      ? z.infer<ZodObject<P>>
      : undefined
    : undefined,
  responseMethods: ResponseMethods
) => Promise<
  { status: number } & (
    | { response: MaestroResponse<key, method> }
    | { response?: never }
  )
>;

export type ProtectedSubRouter = {
  [key in ProtectedRoutes]?: {
    [method in Exclude<
      MaestroRouteProtectedMethod<key>,
      'params'
    >]: MaestroRouteMethod<key, method, true>;
  };
};

export type UnprotectedSubRouter = {
  [key in UnprotectedRoutes]?: {
    [method in Exclude<
      MaestroRouteUnprotectedMethod<key>,
      'params'
    >]: MaestroRouteMethod<key, method, false>;
  };
};

export const generateRoutes = <
  IsProtected extends boolean,
  T extends ProtectedSubRouter | UnprotectedSubRouter = IsProtected extends true
    ? ProtectedSubRouter
    : UnprotectedSubRouter
>(
  subRouter: T,
  isProtected: IsProtected
) => {
  const router = express.Router();

  (Object.keys(subRouter) as Array<keyof typeof routes>).forEach((route) => {
    (Object.keys(routes[route]) as Array<RouteMethod | 'params'>).forEach(
      (method) => {
        if (method === 'params') {
          return;
        }

        const r = routes[route];
        // @ts-expect-error TS7053
        const conf = r[method] as ToRoute;

        if (isProtected && 'unprotected' in conf) {
          return;
        }
        if (!isProtected && !('unprotected' in conf)) {
          return;
        }

        let toValidate: null | ZodObject<any> = null;
        if ('body' in conf && conf.body !== undefined) {
          toValidate = body(conf.body);
        }
        if ('query' in conf && conf.query !== undefined) {
          const toValidateQuery = query(conf.query);
          if (toValidate === null) {
            toValidate = toValidateQuery;
          } else {
            toValidate = toValidate.merge(toValidateQuery);
          }
        }

        if (toValidate !== null) {
          router[method](route, validator.validate(toValidate));
        }
        if ('permissions' in conf) {
          router[method](route, permissionsCheck(conf.permissions));
        }
        router[method](route, async (request, response) => {
          let p = {};
          if ('params' in r && r.params !== undefined) {
            try {
              p = z.object(r.params).parse(request.params);
            } catch (error) {
              console.error(error);
              return response
                .status(constants.HTTP_STATUS_BAD_REQUEST)
                .json(error);
            }
          }

          const responseMethods: ResponseMethods = {
            setHeader: (key, value) => response.setHeader(key, value),
            clearCookie: (key) => response.clearCookie(key)
          };

          // @ts-expect-error TS2345 Impossible de faire mieux
          const result = await subRouter[route][method](
            request,
            p,
            responseMethods
          );

          if ('status' in result && !('response' in result)) {
            response.sendStatus(result.status);
          } else {
            const strippedResult = conf.response?.parse(result.response);
            response.status(result.status).send(strippedResult);
          }
        });
      }
    );
  });

  return router;
};
