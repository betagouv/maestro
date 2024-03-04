import express from 'express';
import { jwtCheck, userCheck } from '../middlewares/auth';

const router = express.Router();
router.use(jwtCheck(false))
router.use(userCheck(false));

export default router;
