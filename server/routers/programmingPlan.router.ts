import express from 'express';
import { ProgrammingPlanRegionalStatus } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingPlanRegionalStatus';
import { z } from 'zod/v4';
import programmingPlanController from '../controllers/programmingPlanController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import { programmingPlanCheck } from '../middlewares/checks/programmingPlanCheck';
import validator, { body, uuidParam } from '../middlewares/validator';
const router = express.Router();

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

export default router;
