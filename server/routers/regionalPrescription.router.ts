import express from 'express';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import {
  RegionalPrescriptionKey,
  RegionalPrescriptionUpdate,
} from '../../shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionCommentToCreate } from '../../shared/schema/RegionalPrescription/RegionalPrescriptionComment';
import regionalPrescriptionController from '../controllers/regionalPrescriptionController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { programmingPlanCheck } from '../middlewares/checks/programmingPlanCheck';
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
  permissionsCheck(['updatePrescription', 'updatePrescriptionLaboratory']), //TODO specific permission
  programmingPlanCheck('InProgress'),
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
  programmingPlanCheck('Submitted'),
  regionalPrescriptionController.commentRegionalPrescription
);

router.get(
  '/:prescriptionId/regions/:region/laboratory',
  validator.validate(params(RegionalPrescriptionKey)),
  permissionsCheck(['readPrescriptions']),
  regionalPrescriptionController.getRegionalPrescriptionLaboratory
);

export default router;
