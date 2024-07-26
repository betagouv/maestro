import express from 'express';
import z from 'zod';
import {
  AnalysisToCreate,
  PartialAnalysis,
} from '../../shared/schema/Analysis/Analysis';
import analysisController from '../controllers/analysisController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, query, uuidParam } from '../middlewares/validator';
const router = express.Router();

router.get(
  '',
  validator.validate(query(z.object({ sampleId: z.string().uuid() }))),
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
