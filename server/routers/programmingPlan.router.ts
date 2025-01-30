import express from 'express';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanStatusUpdate } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlans';
import { z } from 'zod';
import programmingPlanController from '../controllers/programmingPlanController';
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
  validator.validate(query(FindProgrammingPlanOptions)),
  permissionsCheck(['readProgrammingPlans']),
  programmingPlanController.findProgrammingPlans
);
router.get(
  '/:year',
  validator.validate(
    params(
      z.object({
        year: z.coerce.number().int()
      })
    )
  ),
  permissionsCheck(['readProgrammingPlans']),
  programmingPlanController.getProgrammingPlanByYear
);
router.post(
  '/:year',
  validator.validate(
    params(
      z.object({
        year: z.coerce.number().int()
      })
    )
  ),
  permissionsCheck(['manageProgrammingPlan']),
  programmingPlanController.createProgrammingPlan
);
router.put(
  '/:programmingPlanId',
  validator.validate(
    uuidParam('programmingPlanId').merge(body(ProgrammingPlanStatusUpdate))
  ),
  permissionsCheck(['manageProgrammingPlan']),
  programmingPlanCheck(),
  programmingPlanController.updateProgrammingPlan
);

export default router;
