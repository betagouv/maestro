import express from 'express';
import {
  AnalysisToCreate,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import z, { ZodObject, ZodType } from 'zod';
import analysisController from '../controllers/analysisController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, params, query } from '../middlewares/validator';
import { UserPermission } from 'maestro-shared/schema/User/UserPermission';
import type { Request, Response } from 'express'
import { User } from 'maestro-shared/schema/User/User';

type ToRoute = {
  query?: ZodType,
  params?: ZodType,
  body?: ZodType,
  permissions: UserPermission[],
}

type METHOD = 'GET' | 'POST' | 'PUT'

const routes = {
  'GET /': {
    query: z.object({ sampleId: z.string().uuid() }),
    permissions: ['readAnalysis'],
  },
  'POST /': {
    body: AnalysisToCreate,
    permissions: ['createAnalysis'],
  },
  'PUT /:analysisId': {
    body: PartialAnalysis,
    params:z.object({
      'analysisId': z.string().uuid()
    }),
    //FIXME c'est bien ça?
    permissions: ['createAnalysis'],
  }
} as const satisfies  Record<`${METHOD} /${string}`, ToRoute>

type MaestroRoutes = keyof typeof routes
type MaestroQuery<key extends MaestroRoutes>= (typeof routes)[key] extends { query: infer Q } ? Q extends ZodType ? z.infer<Q> : undefined : undefined
type MaestroParams<key extends MaestroRoutes>= (typeof routes)[key] extends { params: infer P } ? P extends ZodType ? z.infer<P> : undefined : undefined
type MaestroBody<key extends MaestroRoutes>= (typeof routes)[key] extends { body: infer B } ? B extends ZodType ? z.infer<B> : undefined : undefined

export type MaestroRouteMethod<key extends MaestroRoutes> = (request: Request<MaestroParams<key>, undefined, MaestroBody<key>,  MaestroQuery<key>> & { user: User}, response: Response) => void

const routesControllerMethod = {
  'GET /': analysisController.getAnalysis,
  'POST /': analysisController.createAnalysis,
  'PUT /:analysisId': analysisController.updateAnalysis
} as const satisfies  { [key in MaestroRoutes]: MaestroRouteMethod<key> }


const router = express.Router();

Object.keys(routes).forEach((path) => {

  const route = path as MaestroRoutes
  const conf = routes[route]
  let toValidate: null | ZodObject<any>= null
  if('params' in conf){
    toValidate = params(conf.params)
  }
  if( 'body' in conf ){
    const toValidateBody = body(conf.body)
    if (toValidate === null) {
      toValidate = toValidateBody
    }else {
      toValidate = toValidate.merge(toValidateBody)
    }
  }
  if( 'query' in conf ){
    const toValidateQuery = query(conf.query)
    if (toValidate === null) {
      toValidate = toValidateQuery
    }else {
      toValidate = toValidate.merge(toValidateQuery)
    }
  }

  const url= path.substring(path.indexOf(' ') + 1)
  const method: 'get' | 'post' | 'put' = path.startsWith('GET') ? 'get' : path.startsWith('POST') ? 'post' : 'put'

  if (toValidate !== null) {
   router[method](url, validator.validate(toValidate))
  }
  router[method](url, permissionsCheck(conf.permissions))
  router[method](url, routesControllerMethod[route])

})


export default router;
