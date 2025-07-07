import express from 'express';
import { FindSampleOptions } from 'maestro-shared/schema/Sample/FindSampleOptions';
import { z } from 'zod/v4';
import sampleController from '../controllers/sampleController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { sampleCheck } from '../middlewares/checks/sampleCheck';
import validator, { params, query } from '../middlewares/validator';
const router = express.Router();

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

export default router;
