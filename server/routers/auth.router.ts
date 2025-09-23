import express from 'express';
import authController from '../controllers/authController';
import { jwtCheck } from '../middlewares/checks/authCheck';

const authRouter = express.Router();

authRouter.get('/redirect-url', authController.getAuthRedirectUrl);
authRouter.post(
  '/',
  // validator.validate(body(AuthRedirectUrl), {
  //   skipSanitization: true
  // }),
  authController.authenticate
);

authRouter.use(jwtCheck(true));
authRouter.post('/logout', authController.logout);

export default authRouter;
