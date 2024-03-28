import express from 'express';
import programmingPlanController from '../controllers/programmingPlanController';
import { permissionsCheck } from '../middlewares/auth';
import validator, { uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get(
  '',
  permissionsCheck(['readProgrammingPlans']),
  programmingPlanController.findProgrammingPlans
);
router.get(
  '/:programmingPlanId',
  validator.validate(uuidParam('programmingPlanId')),
  permissionsCheck(['readProgrammingPlans']),
  programmingPlanController.getProgrammingPlan
);

export default router;
