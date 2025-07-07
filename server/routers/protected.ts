import express from 'express';
import fs from 'fs';
import { analysisRouter } from '../controllers/analysisController';
import { analysisReportDocumentsRouter } from '../controllers/analysisReportDocumentsController';
import { programmingPlanRouter } from '../controllers/programmingPlanController';
import { sampleRou } from '../controllers/sampleController';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import addressRouter from './address.router';
import companyRouter from './company.router';
import documentRouter from './document.router';
import laboratoryRouter from './laboratory.router';
import notificationRouter from './notification.router';
import prescriptionRouter from './prescription.router';
import regionalPrescriptionRouter from './regionalPrescription.router';
import { generateRoutes, SubRouter } from './routes.type';
import sampleRouter from './sample.router';
import userRouter from './user.router';

export const protectedRouter = express.Router();

protectedRouter.use(jwtCheck(true));
protectedRouter.use(userCheck(true));

const router = {
  ...analysisRouter,
  ...analysisReportDocumentsRouter,
  ...programmingPlanRouter,
  ...sampleRou
} as const satisfies Required<SubRouter>;

protectedRouter.use('/addresses', addressRouter);
protectedRouter.use('/companies', companyRouter);
protectedRouter.use('/documents', documentRouter);
protectedRouter.use('/laboratories', laboratoryRouter);
protectedRouter.use('/notifications', notificationRouter);
protectedRouter.use('/prescriptions', prescriptionRouter);
protectedRouter.use('/prescriptions', regionalPrescriptionRouter);
protectedRouter.use('/samples', sampleRouter);
protectedRouter.use('/users', userRouter);
protectedRouter.use(generateRoutes(router));

protectedRouter.get('/regions.geojson', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  fs.createReadStream(import.meta.dirname + '/../data/regions.json').pipe(res);
});
