import express from 'express';
import { FindRegionalPrescriptionOptions } from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescriptionUpdate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionCommentToCreate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import { z } from 'zod';
import regionalPrescriptionController from '../controllers/regionalPrescriptionController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { programmingPlanCheck } from '../middlewares/checks/programmingPlanCheck';
import { regionalPrescriptionCheck } from '../middlewares/checks/regionalPrescriptionCheck';
import validator, { body, query, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get(
  '',
  validator.validate(query(FindRegionalPrescriptionOptions)),
  permissionsCheck(['readPrescriptions']),
  programmingPlanCheck(),
  regionalPrescriptionController.findRegionalPrescriptions
);
router.put(
  '/:regionalPrescriptionId',
  validator.validate(
    z.object({
      ...uuidParam('regionalPrescriptionId').shape,
      ...body(RegionalPrescriptionUpdate).shape
    })
  ),
  permissionsCheck(['updatePrescription', 'updatePrescriptionLaboratory']),
  programmingPlanCheck(),
  regionalPrescriptionCheck(),
  regionalPrescriptionController.updateRegionalPrescription
);
router.post(
  '/:regionalPrescriptionId/comments',
  validator.validate(
    z.object({
      ...uuidParam('regionalPrescriptionId').shape,
      ...body(RegionalPrescriptionCommentToCreate).shape
    })
  ),
  permissionsCheck(['commentPrescription']),
  programmingPlanCheck(),
  regionalPrescriptionCheck(),
  regionalPrescriptionController.commentRegionalPrescription
);

export default router;
