import express, { Request } from 'express';
import {
  MaestroRoutes,
  RouteMethod,
  routes,
  RouteValidator,
  ToRoute
} from 'maestro-shared/routes';
import { User } from 'maestro-shared/schema/User/User';
import { ZodObject } from 'zod/v4';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, params, query } from '../middlewares/validator';

type MaestroResponse<
  key extends MaestroRoutes,
  method extends keyof (typeof routes)[key],
  ResponseValidator = RouteValidator<key, method, 'response'>
> = ResponseValidator extends undefined ? void : ResponseValidator;

export type MaestroRouteMethod<
  key extends MaestroRoutes,
  method extends keyof (typeof routes)[key]
> = (
  request: Request<
    RouteValidator<key, method, 'params'>,
    undefined,
    RouteValidator<key, method, 'body'>,
    RouteValidator<key, method, 'query'>
  > & {
    user: User;
  }
) => Promise<
  | { response: MaestroResponse<key, method>; status: number }
  | { status: number }
  | {
      response: MaestroResponse<key, method>;
    }
>;

export type SubRouter = {
  [key in MaestroRoutes]: {
    [method in keyof (typeof routes)[key]]: MaestroRouteMethod<key, method>;
  };
};

export const generateRoutes = (subRouter: SubRouter) => {
  const router = express.Router();

  (Object.keys(subRouter) as Array<keyof typeof routes>).forEach((route) => {
    (Object.keys(routes[route]) as Array<RouteMethod>).forEach((method) => {
      // @ts-expect-error TS7053
      const conf = routes[route][method] as ToRoute;
      let toValidate: null | ZodObject<any> = null;
      if ('params' in conf && conf.params !== undefined) {
        toValidate = params(conf.params);
      }
      if ('body' in conf && conf.body !== undefined) {
        const toValidateBody = body(conf.body);
        if (toValidate === null) {
          toValidate = toValidateBody;
        } else {
          toValidate = toValidate.merge(toValidateBody);
        }
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
      router[method](route, permissionsCheck(conf.permissions));
      router[method](route, async (request, response) => {
        // @ts-expect-error TS2345 Impossible de faire mieux
        const result = await subRouter[route][method](request);

        if ('status' in result && !('response' in result)) {
          response.sendStatus(result.status);
        } else {
          const strippedResult = conf.response?.parse(result.response);
          if (!('status' in result) && 'response' in result) {
            response.send(strippedResult);
          } else {
            response.status(result.status).send(strippedResult);
          }
        }
      });
    });
  });

  return router;
};
