import express from 'express';
import { z } from 'zod';
import {
  PrescriptionToCreate,
  PrescriptionUpdate,
} from '../../shared/schema/Prescription/Prescription';
import {
  PartialSample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import prescriptionController from '../controllers/prescriptionController';
import programmingPlanController from '../controllers/programmingPlanController';
import sampleController from '../controllers/sampleController';
import userController from '../controllers/userController';
import { jwtCheck, permissionsCheck, userCheck } from '../middlewares/auth';
import validator, { body, params, uuidParam } from '../middlewares/validator';
const router = express.Router();

router.use(jwtCheck(true));
router.use(userCheck(true));

router.get('/samples', sampleController.findSamples);
router.get(
  '/samples/:sampleId',
  validator.validate(uuidParam('sampleId')),
  sampleController.getSample
);
router.post(
  '/samples',
  validator.validate(body(SampleToCreate)),
  sampleController.createSample
);
router.put(
  '/samples/:sampleId',
  validator.validate(uuidParam('sampleId').merge(body(PartialSample))),
  sampleController.updateSample
);

router.get(
  '/users/:userId',
  validator.validate(uuidParam('userId')),
  userController.getUser
);

router.get(
  '/programming-plans',
  programmingPlanController.findProgrammingPlans
);
router.get(
  '/programming-plans/:programmingPlanId',
  validator.validate(uuidParam('programmingPlanId')),
  programmingPlanController.getProgrammingPlan
);

router.get(
  '/programming-plans/:programmingPlanId/prescriptions',
  validator.validate(uuidParam('programmingPlanId')),
  permissionsCheck(['readPrescriptions']),
  prescriptionController.findPrescriptions
);
router.post(
  '/programming-plans/:programmingPlanId/prescriptions',
  validator.validate(
    uuidParam('programmingPlanId').merge(body(z.array(PrescriptionToCreate)))
  ),
  permissionsCheck(['createPrescription']),
  prescriptionController.createPrescriptions
);
router.put(
  '/programming-plans/:programmingPlanId/prescriptions/:prescriptionId',
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
  '/programming-plans/:programmingPlanId/prescriptions',
  validator.validate(
    uuidParam('programmingPlanId').merge(body(z.array(z.string().uuid())))
  ),
  permissionsCheck(['deletePrescription']),
  prescriptionController.deletePrescriptions
);

export default router;
