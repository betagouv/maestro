import express from 'express';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanRegionalStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanRegionalStatus';
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
  '/:programmingPlanId/regional-status',
  validator.validate(
    uuidParam('programmingPlanId').merge(
      body(z.array(ProgrammingPlanRegionalStatus))
    )
  ),
  permissionsCheck(['manageProgrammingPlan']),
  programmingPlanCheck(),
  programmingPlanController.updateRegionalStatus
);

export default router;
