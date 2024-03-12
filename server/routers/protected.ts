import express from 'express';
import { jwtCheck, userCheck } from '../middlewares/auth';
import validator, { body } from '../middlewares/validator';
import { SampleToCreate } from '../../shared/schema/Sample';
import sampleController from '../controllers/sampleController';

const router = express.Router();

router.use(jwtCheck(true))
router.use(userCheck(true));

router.post('/samples', validator.validate(body(SampleToCreate)), sampleController.createSample);

export default router;
