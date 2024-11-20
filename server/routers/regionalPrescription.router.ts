import express from 'express';
import { z } from 'zod';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescriptionUpdate } from '../../shared/schema/RegionalPrescription/RegionalPrescription';
import regionalPrescriptionController from '../controllers/regionalPrescriptionController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { programmingPlanCheck } from '../middlewares/checks/programmingPlanCheck';
import validator, { body, params, query } from '../middlewares/validator';

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
    params(
      z.object({
        regionalPrescriptionId: z.string().uuid(),
      })
    ).merge(body(RegionalPrescriptionUpdate))
  ),
  permissionsCheck(['updatePrescription', 'updatePrescriptionLaboratory']),
  programmingPlanCheck('InProgress'),
  regionalPrescriptionController.updateRegionalPrescription
);
export default router;
