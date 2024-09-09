import express from 'express';
import { constants } from 'http2';
import { SignIn } from '../../shared/schema/SignIn';
import accountController from '../controllers/accountController';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import validator, { body } from '../middlewares/validator';

const router = express.Router();
router.use(jwtCheck(false));
router.use(userCheck(false));

router.get('/test', (req, res) => {
  console.log('test exécuté');

  res.set('Content-Type', 'application/json; charset=utf-8');

  return res.status(constants.HTTP_STATUS_OK).json({
    result: 'test exécuté',
  });
});

router.post(
  '/accounts/sign-in',
  validator.validate(body(SignIn)),
  accountController.signIn
);

export default router;
