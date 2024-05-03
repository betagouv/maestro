import express from 'express';
import { z } from 'zod';
import { FindPrescriptionOptions } from '../../shared/schema/Prescription/FindPrescriptionOptions';
import {
  PrescriptionToCreate,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import prescriptionController from '../controllers/prescriptionController';
import { permissionsCheck } from '../middlewares/auth';
import { programmingPlanCheck } from '../middlewares/plan';
import validator, {
  body,
  params,
  query,
  uuidParam,
} from '../middlewares/validator';

const router = express.Router();

router.get(
  '/:programmingPlanId/prescriptions',
  validator.validate(
    uuidParam('programmingPlanId').merge(
      query(FindPrescriptionOptions.omit({ programmingPlanId: true }))
    )
  ),
  permissionsCheck(['readPrescriptions']),
  programmingPlanCheck(),
  prescriptionController.findPrescriptions
);
router.get(
  '/:programmingPlanId/prescriptions/export',
  validator.validate(
    uuidParam('programmingPlanId').merge(
      query(FindPrescriptionOptions.omit({ programmingPlanId: true }))
    )
  ),
  permissionsCheck(['readPrescriptions']),
  programmingPlanCheck(),
  prescriptionController.exportPrescriptions
);
router.post(
  '/:programmingPlanId/prescriptions',
  validator.validate(
    uuidParam('programmingPlanId').merge(body(z.array(PrescriptionToCreate)))
  ),
  permissionsCheck(['createPrescription']),
  programmingPlanCheck('InProgress'),
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
  permissionsCheck([
    'updatePrescriptionSampleCount',
    'updatePrescriptionLaboratory',
  ]),
  programmingPlanCheck('InProgress'),
  prescriptionController.updatePrescription
);
router.delete(
  '/:programmingPlanId/prescriptions',
  validator.validate(
    uuidParam('programmingPlanId').merge(body(z.array(z.string().uuid())))
  ),
  permissionsCheck(['deletePrescription']),
  programmingPlanCheck('InProgress'),
  prescriptionController.deletePrescriptions
);
export default router;
