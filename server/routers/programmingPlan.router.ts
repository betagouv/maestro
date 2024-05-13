import express from 'express';
import { FindProgrammingPlanOptions } from '../../shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import programmingPlanController from '../controllers/programmingPlanController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { programmingPlanCheck } from '../middlewares/checks/programmingPlanCheck';
import validator, { query, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get(
  '',
  validator.validate(query(FindProgrammingPlanOptions)),
  permissionsCheck(['readProgrammingPlans']),
  programmingPlanController.findProgrammingPlans
);
router.get(
  '/:programmingPlanId',
  validator.validate(uuidParam('programmingPlanId')),
  permissionsCheck(['readProgrammingPlans']),
  programmingPlanCheck(),
  programmingPlanController.getProgrammingPlan
);

export default router;
