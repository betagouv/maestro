import express from 'express';
import { AuthRedirectUrl } from '../../shared/schema/Auth/AuthRedirectUrl';
import authController from '../controllers/authController';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import validator, { body } from '../middlewares/validator';

const authRouter = express.Router();

authRouter.get('/redirect-url', authController.getAuthRedirectUrl);
authRouter.post(
  '/',
  validator.validate(body(AuthRedirectUrl)),
  authController.authenticate
);

authRouter.use(jwtCheck(true));
authRouter.use(userCheck(true));
authRouter.post('/logout', authController.logout);

export default authRouter;
