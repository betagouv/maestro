import express from 'express';
import {
  AnalysisToCreate,
  PartialAnalysis
} from 'maestro-shared/schema/Analysis/Analysis';
import z from 'zod/v4';
import analysisController from '../controllers/analysisController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, query, uuidParam } from '../middlewares/validator';
const router = express.Router();

router.get(
  '',
  validator.validate(query(z.object({ sampleId: z.guid() }))),
  permissionsCheck(['readAnalysis']),
  analysisController.getAnalysis
);
router.post(
  '',
  validator.validate(body(AnalysisToCreate)),
  permissionsCheck(['createAnalysis']),
  analysisController.createAnalysis
);
router.put(
  '/:analysisId',
  validator.validate(uuidParam('analysisId').merge(body(PartialAnalysis))),
  permissionsCheck(['createAnalysis']),
  analysisController.updateAnalysis
);

export default router;
