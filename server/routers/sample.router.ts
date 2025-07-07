import express from 'express';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import { PartialSampleToCreate } from 'maestro-shared/schema/Sample/Sample';
import { z } from 'zod/v4';
import sampleController from '../controllers/sampleController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import {
  sampleCheck,
  sampleLocalisationCheck
} from '../middlewares/checks/sampleCheck';
import validator, { body, params, query } from '../middlewares/validator';
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
        sampleId: z.guid(),
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
  sampleLocalisationCheck(),
  sampleController.createSample
);

export default router;
