import express from 'express';
import { z } from 'zod';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionsToCreate,
  PrescriptionsToDelete,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import prescriptionController from '../controllers/prescriptionController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { programmingPlanCheck } from '../middlewares/checks/programmingPlanCheck';
import validator, { body, params, query } from '../middlewares/validator';

const router = express.Router();

router.get(
  '',
  validator.validate(query(FindPrescriptionOptions)),
  permissionsCheck(['readPrescriptions']),
  programmingPlanCheck(),
  prescriptionController.findPrescriptions
);
router.get(
  '/export',
  validator.validate(query(FindPrescriptionOptions)),
  permissionsCheck(['readPrescriptions']),
  programmingPlanCheck(),
  prescriptionController.exportPrescriptions
);
router.post(
  '',
  validator.validate(body(PrescriptionsToCreate)),
  permissionsCheck(['createPrescription']),
  programmingPlanCheck('InProgress'),
  prescriptionController.createPrescriptions
);
router.put(
  '/:prescriptionId',
  validator.validate(
    params(
      z.object({
        prescriptionId: z.string().uuid(),
      })
    ).merge(body(PrescriptionUpdate))
  ),
  permissionsCheck([
    'updatePrescriptionSampleCount',
    'updatePrescriptionLaboratory',
  ]),
  programmingPlanCheck('InProgress'),
  prescriptionController.updatePrescription
);
router.delete(
  '',
  validator.validate(body(PrescriptionsToDelete)),
  permissionsCheck(['deletePrescription']),
  programmingPlanCheck('InProgress'),
  prescriptionController.deletePrescriptions
);
export default router;
