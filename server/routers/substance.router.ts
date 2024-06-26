import express from 'express';
import { FindSubstanceAnalysisOptions } from '../../shared/schema/Substance/FindSubstanceAnalysisOptions';
import substanceController from '../controllers/substanceController';
import validator, { query } from '../middlewares/validator';

const router = express.Router();

router.get(
  '/analysis',
  validator.validate(query(FindSubstanceAnalysisOptions)),
  substanceController.findSubstanceAnalysis
);

export default router;
