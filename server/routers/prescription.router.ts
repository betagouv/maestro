import express from 'express';
import { z } from 'zod';
import {
  PrescriptionToCreate,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import prescriptionController from '../controllers/prescriptionController';
import { permissionsCheck } from '../middlewares/auth';
import validator, { body, params, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get(
  '/:programmingPlanId/prescriptions',
  validator.validate(uuidParam('programmingPlanId')),
  permissionsCheck(['readPrescriptions']),
  prescriptionController.findPrescriptions
);
router.get(
  '/:programmingPlanId/prescriptions/export',
  validator.validate(uuidParam('programmingPlanId')),
  permissionsCheck(['readPrescriptions']),
  prescriptionController.exportPrescriptions
);
router.post(
  '/:programmingPlanId/prescriptions',
  validator.validate(
    uuidParam('programmingPlanId').merge(body(z.array(PrescriptionToCreate)))
  ),
  permissionsCheck(['createPrescription']),
  prescriptionController.createPrescriptions
);
router.put(
  '/:programmingPlanId/prescriptions/:prescriptionId',
  validator.validate(
    params(
      z.object({
        programmingPlanId: z.string().uuid(),
        prescriptionId: z.string().uuid(),
      })
    ).merge(body(PrescriptionUpdate))
  ),
  permissionsCheck(['updatePrescription']),
  prescriptionController.updatePrescription
);
router.delete(
  '/:programmingPlanId/prescriptions',
  validator.validate(
    uuidParam('programmingPlanId').merge(body(z.array(z.string().uuid())))
  ),
  permissionsCheck(['deletePrescription']),
  prescriptionController.deletePrescriptions
);
export default router;
