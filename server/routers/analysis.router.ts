import express from 'express';
import { AnalysisToCreate } from '../../shared/schema/Analysis/Analysis';
import analysisController from '../controllers/analysisController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body, uuidParam } from '../middlewares/validator';
const router = express.Router();

router.get(
  '/:sampleId',
  validator.validate(uuidParam('sampleId')),
  permissionsCheck(['readAnalysis']),
  analysisController.getAnalysis
);
router.post(
  '',
  validator.validate(body(AnalysisToCreate)),
  permissionsCheck(['createAnalysis']),
  analysisController.createAnalysis
);

export default router;
