import express from 'express';
import {
  PartialSample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import sampleController from '../controllers/sampleController';
import validator, { body, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get('', sampleController.findSamples);
router.get(
  '/:sampleId',
  validator.validate(uuidParam('sampleId')),
  sampleController.getSample
);
router.post(
  '',
  validator.validate(body(SampleToCreate)),
  sampleController.createSample
);
router.put(
  '/:sampleId',
  validator.validate(uuidParam('sampleId').merge(body(PartialSample))),
  sampleController.updateSample
);

export default router;
