import express from 'express';
import { AuthRedirectUrl } from '../../shared/schema/Auth/AuthRedirectUrl';
import { SignIn } from '../../shared/schema/SignIn';
import authController from '../controllers/authController';
import validator, { body } from '../middlewares/validator';

const router = express.Router();

router.post(
  '/sign-in',
  validator.validate(body(SignIn)),
  authController.signIn
);

router.get('/redirect-url', authController.getAuthRedirectUrl);
router.post(
  '/',
  validator.validate(body(AuthRedirectUrl)),
  authController.authenticate
);

export default router;
