import express from 'express';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import authRouter from './auth.router';

const router = express.Router();
router.use(jwtCheck(false));
router.use(userCheck(false));

router.use('/auth', authRouter);
export default router;
