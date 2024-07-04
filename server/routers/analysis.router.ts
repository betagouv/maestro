import express from 'express';
import { AnalysisToCreate } from '../../shared/schema/Analysis/Analysis';
import analysisController from '../controllers/analysisController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { body } from '../middlewares/validator';
const router = express.Router();

router.post(
  '',
  validator.validate(body(AnalysisToCreate)),
  permissionsCheck(['createAnalysis']),
  analysisController.createAnalysis
);

export default router;
