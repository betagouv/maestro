import express from 'express';
import { z } from 'zod';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionToCreate,
  PrescriptionUpdate
} from '../../shared/schema/Prescription/Prescription';
import prescriptionController from '../controllers/prescriptionController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { programmingPlanCheck } from '../middlewares/checks/programmingPlanCheck';
import validator, {
  body,
  params,
  query,
  uuidParam
} from '../middlewares/validator';

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
  validator.validate(body(PrescriptionToCreate)),
  permissionsCheck(['createPrescription']),
  programmingPlanCheck(),
  prescriptionController.createPrescription
);
router.put(
  '/:prescriptionId',
  validator.validate(
    params(
      z.object({
        prescriptionId: z.string().uuid()
      })
    ).merge(body(PrescriptionUpdate))
  ),
  permissionsCheck(['updatePrescription']),
  programmingPlanCheck(),
  prescriptionController.updatePrescription
);
router.delete(
  '/:prescriptionId',
  validator.validate(uuidParam('prescriptionId')),
  permissionsCheck(['deletePrescription']),
  prescriptionController.deletePrescription
);
router.get(
  '/:prescriptionId/substances',
  validator.validate(uuidParam('prescriptionId')),
  permissionsCheck(['readPrescriptions']),
  prescriptionController.getPrescriptionSubstances
);
export default router;
