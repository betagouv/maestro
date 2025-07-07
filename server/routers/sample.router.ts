import express from 'express';
import { z } from 'zod/v4';
import sampleController from '../controllers/sampleController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { sampleCheck } from '../middlewares/checks/sampleCheck';
import validator, { params } from '../middlewares/validator';
const router = express.Router();

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
