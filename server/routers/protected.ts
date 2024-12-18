import express from 'express';
import fs from 'fs';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import addressRouter from './address.router';
import analysisRouter from './analysis.router';
import companyRouter from './company.router';
import documentRouter from './document.router';
import laboratoryRouter from './laboratory.router';
import prescriptionRouter from './prescription.router';
import programmingPlanRouter from './programmingPlan.router';
import regionalPrescriptionRouter from './regionalPrescription.router';
import sampleRouter from './sample.router';
import substanceRouter from './substance.router';
import userRouter from './user.router';

export const protectedRouter = express.Router();

protectedRouter.use(jwtCheck(true));
protectedRouter.use(userCheck(true));

protectedRouter.use('/analysis', analysisRouter);
protectedRouter.use('/addresses', addressRouter);
protectedRouter.use('/companies', companyRouter);
protectedRouter.use('/documents', documentRouter);
protectedRouter.use('/laboratories', laboratoryRouter);
protectedRouter.use('/prescriptions', prescriptionRouter);
protectedRouter.use('/prescriptions', regionalPrescriptionRouter);
protectedRouter.use('/programming-plans', programmingPlanRouter);
protectedRouter.use('/samples', sampleRouter);
protectedRouter.use('/substances', substanceRouter);
protectedRouter.use('/users', userRouter);

protectedRouter.get('/regions.geojson', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  fs.createReadStream(__dirname + '/../data/regions.json').pipe(res);
});

