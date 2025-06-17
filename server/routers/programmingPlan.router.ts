import express from 'express';
import { FindProgrammingPlanOptions } from 'maestro-shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import { ProgrammingPlanRegionalStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanRegionalStatus';
import { ProgrammingPlanStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import { z } from 'zod/v4';
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
  '/:programmingPlanId',
  validator.validate(uuidParam('programmingPlanId')),
  permissionsCheck(['readProgrammingPlans']),
  programmingPlanController.getProgrammingPlan
);
router.get(
  '/years/:year',
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
  '/years/:year',
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
    z.object({
      ...uuidParam('programmingPlanId').shape,
      ...body(z.array(ProgrammingPlanRegionalStatus)).shape
    })
  ),
  permissionsCheck(['manageProgrammingPlan', 'approveProgrammingPlan']),
  programmingPlanCheck(),
  programmingPlanController.updateRegionalStatus
);
router.put(
  '/:programmingPlanId',
  validator.validate(
    z.object({
      ...uuidParam('programmingPlanId').shape,
      ...body(
        z.object({
          status: ProgrammingPlanStatus
        })
      ).shape
    })
  ),
  permissionsCheck(['manageProgrammingPlan', 'approveProgrammingPlan']),
  programmingPlanCheck(),
  programmingPlanController.updateStatus
);

export default router;
