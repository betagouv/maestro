import type { Request } from 'express';
import express from 'express';
import {
  AnalysisToCreate,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { User } from 'maestro-shared/schema/User/User';
import { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import z, { AnyZodObject, ZodObject, ZodType } from 'zod';
import analysisController from '../controllers/analysisController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, params, query } from '../middlewares/validator';

type ToRoute = {
  query?: AnyZodObject;
  params?: AnyZodObject;
  body?: AnyZodObject;
  permissions: UserPermission[];
  response?: ZodType;
};

type Method = 'get' | 'post' | 'put';

const routes = {
  '/': {
    get: {
      query: z.object({ sampleId: z.string().uuid() }),
      permissions: ['readAnalysis'],
      response: PartialAnalysis
    },
    post: {
      body: AnalysisToCreate,
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  },
  '/:analysisId': {
    put: {
      body: PartialAnalysis,
      params: z.object({
        analysisId: z.string().uuid()
      }),
      //FIXME c'est bien ça?
      permissions: ['createAnalysis'],
      response: PartialAnalysis
    }
  }
} as const satisfies Record<string, { [method in Method]?: ToRoute }>;

type MaestroRoutes = keyof typeof routes;

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

type MaestroResponse<key extends MaestroRoutes> = (typeof routes)[key] extends {
  response: infer R;
}
  ? R extends ZodType
    ? z.infer<R>
    : void
  : void;

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
  | { response: MaestroResponse<key>; status: number }
  | { status: number }
  | {
      response: MaestroResponse<key>;
    }
>;

const routesControllerMethod = {
  '/': {
    get: analysisController.getAnalysis,
    post: analysisController.createAnalysis
  },
  '/:analysisId': {
    put: analysisController.updateAnalysis
  }
} as const satisfies {
  [key in MaestroRoutes]: {
    [method in keyof (typeof routes)[key]]: MaestroRouteMethod<key, method>;
  };
};

const router = express.Router();

(Object.keys(routes) as Array<keyof typeof routes>).forEach((route) => {
  (Object.keys(routes[route]) as Array<Method>).forEach((method) => {
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
      const result = await routesControllerMethod[route][method](request);

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

export default router;
