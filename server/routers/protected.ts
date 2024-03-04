import express from 'express';
import { jwtCheck, userCheck } from '../middlewares/auth';

const router = express.Router();

router.use(jwtCheck(true))
router.use(userCheck(true));


export default router;
