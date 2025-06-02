import express from 'express';
import fs from 'fs';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import addressRouter from './address.router';
import { analysisRouterMethods } from './analysis.router';
import companyRouter from './company.router';
import documentRouter from './document.router';
import laboratoryRouter from './laboratory.router';
import notificationRouter from './notification.router';
import prescriptionRouter from './prescription.router';
import programmingPlanRouter from './programmingPlan.router';
import regionalPrescriptionRouter from './regionalPrescription.router';
import { generateRoutes } from './routes.type';
import sampleRouter from './sample.router';
import userRouter from './user.router';

export const protectedRouter = express.Router();

protectedRouter.use(jwtCheck(true));
protectedRouter.use(userCheck(true));

protectedRouter.use(generateRoutes(analysisRouterMethods));
protectedRouter.use('/addresses', addressRouter);
protectedRouter.use('/companies', companyRouter);
protectedRouter.use('/documents', documentRouter);
protectedRouter.use('/laboratories', laboratoryRouter);
protectedRouter.use('/notifications', notificationRouter);
protectedRouter.use('/prescriptions', prescriptionRouter);
protectedRouter.use('/prescriptions', regionalPrescriptionRouter);
protectedRouter.use('/programming-plans', programmingPlanRouter);
protectedRouter.use('/samples', sampleRouter);
protectedRouter.use('/users', userRouter);

protectedRouter.get('/regions.geojson', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  fs.createReadStream(import.meta.dirname + '/../data/regions.json').pipe(res);
});
