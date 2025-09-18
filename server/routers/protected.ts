import express from 'express';
import fs from 'fs';
import { analysisRouter } from '../controllers/analysisController';
import { analysisReportDocumentsRouter } from '../controllers/analysisReportDocumentsController';
import { laboratoriesRouter } from '../controllers/laboratoryController';
import { noticesProtectedRouter } from '../controllers/noticeController';
import { notificationsRouter } from '../controllers/notificationController';
import { programmingPlanRouter } from '../controllers/programmingPlanController';
import { sampleRouter } from '../controllers/sampleController';
import { usersRouter } from '../controllers/userController';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import addressRouter from './address.router';
import companyRouter from './company.router';
import documentRouter from './document.router';
import prescriptionRouter from './prescription.router';
import regionalPrescriptionRouter from './regionalPrescription.router';
import { generateRoutes, ProtectedSubRouter } from './routes.type';

export const protectedRouter = express.Router();

protectedRouter.use(jwtCheck(true));
protectedRouter.use(userCheck(true));

const router = {
  ...analysisRouter,
  ...analysisReportDocumentsRouter,
  ...laboratoriesRouter,
  ...noticesProtectedRouter,
  ...notificationsRouter,
  ...programmingPlanRouter,
  ...sampleRouter,
  ...usersRouter
} as const satisfies Required<ProtectedSubRouter>;

protectedRouter.use(generateRoutes(router, true));
protectedRouter.use('/addresses', addressRouter);
protectedRouter.use('/companies', companyRouter);
protectedRouter.use('/documents', documentRouter);
protectedRouter.use('/prescriptions', prescriptionRouter);
protectedRouter.use('/prescriptions', regionalPrescriptionRouter);

protectedRouter.get('/regions.geojson', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  fs.createReadStream(import.meta.dirname + '/../data/regions.json').pipe(res);
});
