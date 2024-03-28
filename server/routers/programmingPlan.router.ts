import express from 'express';
import programmingPlanController from '../controllers/programmingPlanController';
import validator, { uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get('', programmingPlanController.findProgrammingPlans);
router.get(
  '/:programmingPlanId',
  validator.validate(uuidParam('programmingPlanId')),
  programmingPlanController.getProgrammingPlan
);

export default router;
