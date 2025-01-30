import express from 'express';
import { FindRegionalPrescriptionOptions } from 'maestro-shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  RegionalPrescriptionKey,
  RegionalPrescriptionUpdate
} from 'maestro-shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionCommentToCreate } from 'maestro-shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import regionalPrescriptionController from '../controllers/regionalPrescriptionController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { prescriptionCheck } from '../middlewares/checks/prescriptionCheck';
import { programmingPlanCheck } from '../middlewares/checks/programmingPlanCheck';
import { regionalPrescriptionCheck } from '../middlewares/checks/regionalPrescriptionCheck';
import validator, { body, params, query } from '../middlewares/validator';

const router = express.Router();

router.get(
  '/regions',
  validator.validate(query(FindRegionalPrescriptionOptions)),
  permissionsCheck(['readPrescriptions']),
  programmingPlanCheck(),
  regionalPrescriptionController.findRegionalPrescriptions
);
router.put(
  '/:prescriptionId/regions/:region',
  validator.validate(
    params(RegionalPrescriptionKey).merge(body(RegionalPrescriptionUpdate))
  ),
  permissionsCheck(['updatePrescription', 'updatePrescriptionLaboratory']),
  programmingPlanCheck(),
  prescriptionCheck(),
  regionalPrescriptionCheck(),
  regionalPrescriptionController.updateRegionalPrescription
);
router.post(
  '/:prescriptionId/regions/:region/comments',
  validator.validate(
    params(RegionalPrescriptionKey).merge(
      body(RegionalPrescriptionCommentToCreate)
    )
  ),
  permissionsCheck(['commentPrescription']),
  programmingPlanCheck(),
  prescriptionCheck(),
  regionalPrescriptionCheck(),
  regionalPrescriptionController.commentRegionalPrescription
);

export default router;
