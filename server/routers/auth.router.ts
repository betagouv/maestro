import express from 'express';
import { AuthRedirectUrl } from '../../shared/schema/Auth/AuthRedirectUrl';
import authController from '../controllers/authController';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import validator, { body } from '../middlewares/validator';

const router = express.Router();

router.get('/redirect-url', authController.getAuthRedirectUrl);
router.post(
  '/',
  validator.validate(body(AuthRedirectUrl)),
  authController.authenticate
);

router.use(jwtCheck(true));
router.use(userCheck(true));
router.post('/logout', authController.logout);

export default router;
