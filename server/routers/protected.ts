import express from 'express';
import { jwtCheck, userCheck } from '../middlewares/auth';
import validator, { body, uuidParam } from '../middlewares/validator';
import { PartialSampleUpdate, SampleToCreate } from '../../shared/schema/Sample';
import sampleController from '../controllers/sampleController';

const router = express.Router();

router.use(jwtCheck(true))
router.use(userCheck(true));

router.get('/samples', sampleController.findSamples);
router.get('/samples/:sampleId', validator.validate(uuidParam('sampleId')), sampleController.getSample);
router.post('/samples', validator.validate(body(SampleToCreate)), sampleController.createSample);
router.put('/samples/:sampleId', validator.validate(uuidParam('sampleId').merge(body(PartialSampleUpdate))), sampleController.updateSample);

export default router;
