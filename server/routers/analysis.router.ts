import type { Request } from 'express';
import express from 'express';
import {
  AnalysisToCreate,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import { User } from 'maestro-shared/schema/User/User';
import { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import z, { ZodObject, ZodType } from 'zod';
import analysisController from '../controllers/analysisController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, params, query } from '../middlewares/validator';

type ToRoute = {
  query?: ZodType;
  params?: ZodType;
  body?: ZodType;
  permissions: UserPermission[];
  response?: ZodType;
};

type METHOD = 'GET' | 'POST' | 'PUT';

const routes = {
  'GET /': {
    query: z.object({ sampleId: z.string().uuid() }),
    permissions: ['readAnalysis'],
    response: PartialAnalysis
  },
  'POST /': {
    body: AnalysisToCreate,
    permissions: ['createAnalysis'],
    response: PartialAnalysis
  },
  'PUT /:analysisId': {
    body: PartialAnalysis,
    params: z.object({
      analysisId: z.string().uuid()
    }),
    //FIXME c'est bien ça?
    permissions: ['createAnalysis'],
    response: PartialAnalysis
  }
} as const satisfies Record<`${METHOD} /${string}`, ToRoute>;

type MaestroRoutes = keyof typeof routes;
type MaestroQuery<key extends MaestroRoutes> = (typeof routes)[key] extends {
  query: infer Q;
}
  ? Q extends ZodType
    ? z.infer<Q>
    : undefined
  : undefined;
type MaestroParams<key extends MaestroRoutes> = (typeof routes)[key] extends {
  params: infer P;
}
  ? P extends ZodType
    ? z.infer<P>
    : undefined
  : undefined;
type MaestroBody<key extends MaestroRoutes> = (typeof routes)[key] extends {
  body: infer B;
}
  ? B extends ZodType
    ? z.infer<B>
    : undefined
  : undefined;
type MaestroResponse<key extends MaestroRoutes> = (typeof routes)[key] extends {
  response: infer R;
}
  ? R extends ZodType
    ? z.infer<R>
    : void
  : void;

export type MaestroRouteMethod<key extends MaestroRoutes> = (
  request: Request<
    MaestroParams<key>,
    undefined,
    MaestroBody<key>,
    MaestroQuery<key>
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
  'GET /': analysisController.getAnalysis,
  'POST /': analysisController.createAnalysis,
  'PUT /:analysisId': analysisController.updateAnalysis
} as const satisfies { [key in MaestroRoutes]: MaestroRouteMethod<key> };

const router = express.Router();

Object.keys(routes).forEach((path) => {
  const route = path as MaestroRoutes;
  const conf = routes[route];
  let toValidate: null | ZodObject<any> = null;
  if ('params' in conf) {
    toValidate = params(conf.params);
  }
  if ('body' in conf) {
    const toValidateBody = body(conf.body);
    if (toValidate === null) {
      toValidate = toValidateBody;
    } else {
      toValidate = toValidate.merge(toValidateBody);
    }
  }
  if ('query' in conf) {
    const toValidateQuery = query(conf.query);
    if (toValidate === null) {
      toValidate = toValidateQuery;
    } else {
      toValidate = toValidate.merge(toValidateQuery);
    }
  }

  const url = path.substring(path.indexOf(' ') + 1);
  const method: 'get' | 'post' | 'put' = path.startsWith('GET')
    ? 'get'
    : path.startsWith('POST')
      ? 'post'
      : 'put';

  if (toValidate !== null) {
    router[method](url, validator.validate(toValidate));
  }
  router[method](url, permissionsCheck(conf.permissions));
  router[method](url, async (request, response) => {
    // @ts-expect-error TS2345 Impossible de faire mieux
    const result = await routesControllerMethod[route](request);

    if ('status' in result && !('response' in result)) {
      response.sendStatus(result.status);
    } else {
      const strippedResult = conf.response.parse(result.response);
      if (!('status' in result) && 'response' in result) {
        response.send(strippedResult);
      } else {
        response.status(result.status).send(strippedResult);
      }
    }
  });
});

export default router;
