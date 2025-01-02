import express from 'express';
import { getOpenApiSchema } from '../apidoc/openapi-schema';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import authRouter from './auth.router';

const router = express.Router();
router.use(jwtCheck(false));
router.use(userCheck(false));

router.get('/api-docs', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(getOpenApiSchema());
});

router.use('/auth', authRouter);
export default router;
