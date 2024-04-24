import express from 'express';
import laboratoryController from '../controllers/laboratoryController';
const router = express.Router();

router.get('', laboratoryController.findLaboratories);

export default router;
