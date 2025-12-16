import express, { CookieOptions, Response } from 'express';
import { constants } from 'http2';
import AuthenticationMissingError from 'maestro-shared/errors/authenticationMissingError';
import UserPermissionMissingError from 'maestro-shared/errors/userPermissionMissingError';
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
import { TokenPayload } from 'maestro-shared/schema/User/TokenPayload';
import { hasPermission, User } from 'maestro-shared/schema/User/User';
import z, { ZodObject, ZodRawShape, ZodType } from 'zod';
import { validateRequest } from '../middlewares/validator';

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

type ResponseMethods = Pick<Response, 'setHeader' | 'clearCookie'> & {
  cookie: (name: string, val: string, options: CookieOptions) => Response;
};
type MaestroRouteMethod<
  key extends MaestroRoutes,
  method extends keyof (typeof routes)[key],
  IsProtected extends boolean
> = (
  request: {
    body: RouteValidator<key, method, 'body'>;
    query: RouteValidator<key, method, 'query'>;
    cookies: Record<string, string> | undefined;
  } & (IsProtected extends true
    ? {
        user: User;
        auth: TokenPayload;
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
          toValidate = z.object({
            body: conf.body
          });
        }
        if ('query' in conf && conf.query !== undefined) {
          const toValidateQuery = z.object({
            query: conf.query
          });
          if (toValidate === null) {
            toValidate = toValidateQuery;
          } else {
            toValidate = toValidate.merge(toValidateQuery);
          }
        }
        if ('params' in r && r.params !== undefined) {
          const toValidateQuery = z.object({ params: z.object(r.params) });
          if (toValidate === null) {
            toValidate = toValidateQuery;
          } else {
            toValidate = toValidate.merge(toValidateQuery);
          }
        }

        router[method](route, async (request, response) => {
          let validatedRequest = {
            body: undefined,
            query: undefined,
            params: undefined
          };
          try {
            if (toValidate) {
              // @ts-expect-error TS2739
              validatedRequest = await validateRequest(request, toValidate, {
                skipSanitization: 'skipSanitization' in conf
              });
            }
          } catch (error) {
            console.error(error);
            return response
              .status(constants.HTTP_STATUS_BAD_REQUEST)
              .json(error);
          }

          if ('permissions' in conf) {
            if (!request.user) {
              throw new AuthenticationMissingError(request.user);
            }
            if (conf.permissions !== 'NONE') {
              if (
                !hasPermission(
                  request.user as unknown as User,
                  ...conf.permissions
                )
              ) {
                throw new UserPermissionMissingError();
              }
            }
          }

          const responseMethods: ResponseMethods = {
            setHeader: (key, value) => response.setHeader(key, value),
            clearCookie: (key) => response.clearCookie(key),
            cookie: (name: string, val: string, options: CookieOptions) =>
              response.cookie(name, val, options)
          };

          try {
            // @ts-expect-error TS2345 Impossible de faire mieux
            const result = await subRouter[route][method](
              {
                ...validatedRequest,
                user: request.user,
                auth: request.auth,
                cookies: request.cookies
              },
              validatedRequest.params,
              responseMethods
            );

            if ('status' in result && !('response' in result)) {
              response.status(result.status).send(undefined);
            } else {
              const strippedResult = conf.response?.parse(result.response);
              response.status(result.status).send(strippedResult);
            }
          } catch (e: any) {
            if (!('status' in e)) {
              response
                .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
                .send(e.message);
            } else {
              throw e;
            }
          }
        });
      }
    );
  });

  return router;
};
