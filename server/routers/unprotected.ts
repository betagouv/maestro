import express from 'express';
import { SignIn } from '../../shared/schema/SignIn';
import accountController from '../controllers/accountController';
import { jwtCheck, userCheck } from '../middlewares/auth';
import validator, { body } from '../middlewares/validator';

const router = express.Router();
router.use(jwtCheck(false));
router.use(userCheck(false));

router.post('/accounts/sign-in', validator.validate(body(SignIn)), accountController.signIn);

export default router;
