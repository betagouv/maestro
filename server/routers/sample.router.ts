import express from 'express';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import {
  PartialSample,
  PartialSampleToCreate
} from 'maestro-shared/schema/Sample/Sample';
import { z } from 'zod';
import sampleController from '../controllers/sampleController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { sampleCheck } from '../middlewares/checks/sampleCheck';
import validator, {
  body,
  params,
  query,
  uuidParam
} from '../middlewares/validator';
const router = express.Router();

router.get(
  '',
  validator.validate(query(FindSampleOptions)),
  permissionsCheck(['readSamples']),
  sampleController.findSamples
);
router.get(
  '/count',
  validator.validate(query(FindSampleOptions)),
  permissionsCheck(['readSamples']),
  sampleController.countSamples
);
router.get(
  '/export',
  validator.validate(query(FindSampleOptions)),
  permissionsCheck(['readSamples']),
  sampleController.exportSamples
);
router.get(
  '/:sampleId',
  validator.validate(uuidParam('sampleId')),
  permissionsCheck(['readSamples']),
  sampleCheck(),
  sampleController.getSample
);
router.get(
  '/:sampleId/document',
  permissionsCheck(['downloadSupportDocument']),
  sampleCheck(),
  sampleController.getSampleDocument
);
router.get(
  '/:sampleId/items/:itemNumber/document',
  validator.validate(
    params(
      z.object({
        sampleId: z.string().uuid(),
        itemNumber: z.coerce.number().min(1)
      })
    )
  ),
  permissionsCheck(['downloadSupportDocument']),
  sampleCheck(),
  sampleController.getSampleItemDocument
);
router.post(
  '',
  validator.validate(body(PartialSampleToCreate)),
  permissionsCheck(['createSample']),
  sampleController.createSample
);
router.put(
  '/:sampleId',
  validator.validate(uuidParam('sampleId').merge(body(PartialSample))),
  permissionsCheck(['updateSample', 'restoreSampleToReview']),
  sampleCheck(),
  sampleController.updateSample
);
router.delete(
  '/:sampleId',
  validator.validate(uuidParam('sampleId')),
  permissionsCheck(['deleteSample']),
  sampleCheck(),
  sampleController.deleteSample
);

export default router;
