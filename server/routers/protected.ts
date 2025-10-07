import express from 'express';
import fs from 'fs';
import { analysisRouter } from '../controllers/analysisController';
import { analysisReportDocumentsRouter } from '../controllers/analysisReportDocumentsController';
import { authProtectedRouter } from '../controllers/authController';
import { companiesRouter } from '../controllers/companyController';
import { documentsRouter } from '../controllers/documentController';
import { laboratoriesRouter } from '../controllers/laboratoryController';
import { localPrescriptionsRouter } from '../controllers/localPrescriptionController';
import { mascaradeRouter } from '../controllers/mascaradeController';
import { noticesProtectedRouter } from '../controllers/noticeController';
import { notificationsRouter } from '../controllers/notificationController';
import { prescriptionsRouter } from '../controllers/prescriptionController';
import { programmingPlanRouter } from '../controllers/programmingPlanController';
import { sampleRouter } from '../controllers/sampleController';
import { usersRouter } from '../controllers/userController';
import { jwtCheck, userCheck } from '../middlewares/checks/authCheck';
import addressRouter from './address.router';
import companyRouter from './company.router';
import { generateRoutes, ProtectedSubRouter } from './routes.type';

export const protectedRouter = express.Router();

protectedRouter.use(jwtCheck(true));
protectedRouter.use(userCheck(true));

const router = {
  ...analysisRouter,
  ...analysisReportDocumentsRouter,
  ...authProtectedRouter,
  ...companiesRouter,
  ...documentsRouter,
  ...laboratoriesRouter,
  ...mascaradeRouter,
  ...noticesProtectedRouter,
  ...notificationsRouter,
  ...prescriptionsRouter,
  ...localPrescriptionsRouter,
  ...programmingPlanRouter,
  ...sampleRouter,
  ...usersRouter
} as const satisfies Required<ProtectedSubRouter>;

protectedRouter.use(generateRoutes(router, true));
protectedRouter.use('/addresses', addressRouter);
protectedRouter.use('/companies', companyRouter);

protectedRouter.get('/regions.geojson', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  fs.createReadStream(import.meta.dirname + '/../data/regions.json').pipe(res);
});
