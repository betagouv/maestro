import express from 'express';
import { jwtCheck, userCheck } from '../middlewares/auth';
import prescriptionsRouter from './prescriptions.router';
import programmingPlanRouter from './programmingPlan.router';
import sampleRouter from './sample.router';
import userRouter from './user.router';

const router = express.Router();

router.use(jwtCheck(true));
router.use(userCheck(true));

router.use('/users', userRouter);
router.use('/samples', sampleRouter);
router.use('/programming-plans', programmingPlanRouter);
router.use('/programming-plans', prescriptionsRouter);

export default router;
