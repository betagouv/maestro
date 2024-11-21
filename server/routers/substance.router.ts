import express from 'express';
import { FindSubstanceOptions } from '../../shared/schema/Substance/FindSubstanceOptions';
import substanceController from '../controllers/substanceController';
import validator, { query } from '../middlewares/validator';
const router = express.Router();

router.get(
  '/search',
  validator.validate(query(FindSubstanceOptions)),
  substanceController.searchSubstances
);
export default router;
