import express from 'express';
import { getOpenApiSchema } from '../apidoc/openapi-schema';
import { authUnprotectedRouter } from '../controllers/authController';
import { noticesUnprotectedRouter } from '../controllers/noticeController';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import { generateRoutes, UnprotectedSubRouter } from './routes.type';

const unprotectedRouter = express.Router();
unprotectedRouter.use(jwtCheck(false));
unprotectedRouter.use(userCheck(false));

unprotectedRouter.get('/api-docs', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(getOpenApiSchema());
});

const router = {
  ...authUnprotectedRouter,
  ...noticesUnprotectedRouter
} as const satisfies Required<UnprotectedSubRouter>;

unprotectedRouter.use(generateRoutes(router, false));
export default unprotectedRouter;
