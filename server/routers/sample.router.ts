import express from 'express';
import { z } from 'zod';
import { FindSampleOptions } from '../../shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import { PartialSampleItem } from '../../shared/schema/Sample/SampleItem';
import sampleController from '../controllers/sampleController';
import { permissionsCheck } from '../middlewares/auth';
import validator, { body, query, uuidParam } from '../middlewares/validator';
const router = express.Router();

router.get(
  '',
  validator.validate(query(FindSampleOptions)),
  permissionsCheck(['readSamples']),
  sampleController.findSamples
);
router.get(
  '/:sampleId',
  validator.validate(uuidParam('sampleId')),
  permissionsCheck(['readSamples']),
  sampleController.getSample
);
router.post(
  '',
  validator.validate(body(SampleToCreate)),
  permissionsCheck(['createSample']),
  sampleController.createSample
);
router.put(
  '/:sampleId',
  validator.validate(uuidParam('sampleId').merge(body(PartialSample))),
  permissionsCheck(['updateSample']),
  sampleController.updateSample
);
router.put(
  '/:sampleId/items',
  validator.validate(
    uuidParam('sampleId').merge(body(z.array(PartialSampleItem)))
  ),
  permissionsCheck(['updateSample']),
  sampleController.updateSampleItems
);

export default router;
