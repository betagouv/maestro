import express from 'express';
import { FindPrescriptionOptions } from 'maestro-shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionToCreate,
  PrescriptionUpdate
} from 'maestro-shared/schema/Prescription/Prescription';
import { z } from 'zod';
import prescriptionController from '../controllers/prescriptionController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { prescriptionCheck } from '../middlewares/checks/prescriptionCheck';
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
  prescriptionCheck(),
  prescriptionController.updatePrescription
);
router.delete(
  '/:prescriptionId',
  validator.validate(uuidParam('prescriptionId')),
  permissionsCheck(['deletePrescription']),
  prescriptionCheck(),
  prescriptionController.deletePrescription
);
router.get(
  '/:prescriptionId/substances',
  validator.validate(uuidParam('prescriptionId')),
  permissionsCheck(['readPrescriptions']),
  prescriptionCheck(),
  prescriptionController.getPrescriptionSubstances
);
export default router;
