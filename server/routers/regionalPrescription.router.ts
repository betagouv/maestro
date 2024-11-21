import express from 'express';
import { z } from 'zod';
import { Region } from '../../shared/referential/Region';
import { FindRegionalPrescriptionOptions } from '../../shared/schema/RegionalPrescription/FindRegionalPrescriptionOptions';
import { RegionalPrescriptionUpdate } from '../../shared/schema/RegionalPrescription/RegionalPrescription';
import { RegionalPrescriptionCommentToCreate } from '../../shared/schema/RegionalPrescription/RegionalPrescriptionComment';
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
  permissionsCheck(['updatePrescription', 'updatePrescriptionLaboratory']), //TODO specific permission
  programmingPlanCheck('InProgress'),
  regionalPrescriptionController.updateRegionalPrescription
);
router.post(
  '/:regionalPrescriptionId/comments',
  validator.validate(
    params(
      z.object({
        prescriptionId: z.string().uuid(),
      })
    ).merge(body(RegionalPrescriptionCommentToCreate))
  ),
  permissionsCheck(['commentPrescription']),
  programmingPlanCheck('Submitted'),
  regionalPrescriptionController.commentRegionalPrescription
);

router.get(
  '/:prescriptionId/regions/:region/laboratory',
  validator.validate(
    params(
      z.object({
        prescriptionId: z.string().uuid(),
        region: Region,
      })
    )
  ),
  permissionsCheck(['readPrescriptions']),
  regionalPrescriptionController.getRegionalPrescriptionLaboratory
);

export default router;
