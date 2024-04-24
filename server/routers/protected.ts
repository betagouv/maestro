import express from 'express';
import fs from 'fs';
import { jwtCheck, userCheck } from '../middlewares/auth';
import documentRouter from './document.router';
import laboratoryRouter from './laboratory.router';
import prescriptionRouter from './prescription.router';
import programmingPlanRouter from './programmingPlan.router';
import sampleRouter from './sample.router';
import userRouter from './user.router';

const router = express.Router();

router.use(jwtCheck(true));
router.use(userCheck(true));

router.use('/users', userRouter);
router.use('/samples', sampleRouter);
router.use('/programming-plans', programmingPlanRouter);
router.use('/programming-plans', prescriptionRouter);
router.use('/documents', documentRouter);
router.use('/laboratories', laboratoryRouter);

router.get('/regions.geojson', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  fs.createReadStream(__dirname + '/../data/regions.json').pipe(res);
});

export default router;
