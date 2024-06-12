import express from 'express';
import laboratoryController from '../controllers/laboratoryController';
import validator, { uuidParam } from '../middlewares/validator';
const router = express.Router();

router.get('', laboratoryController.findLaboratories);
router.get(
  '/:laboratoryId',
  validator.validate(uuidParam('laboratoryId')),
  laboratoryController.getLaboratory
);

export default router;
