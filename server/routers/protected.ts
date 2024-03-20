import express from 'express';
import { z } from 'zod';
import { PrescriptionUpdate } from '../../shared/schema/Prescription/Prescription';
import {
  PartialSample,
  SampleToCreate,
} from '../../shared/schema/Sample/Sample';
import prescriptionController from '../controllers/prescriptionController';
import programmingPlanController from '../controllers/programmingPlanController';
import sampleController from '../controllers/sampleController';
import { jwtCheck, userCheck } from '../middlewares/auth';
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
  prescriptionController.findPrescriptions
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
  prescriptionController.updatePrescription
);

export default router;
