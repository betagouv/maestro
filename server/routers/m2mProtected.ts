import express from 'express';
import { checkLaboratoryEmails } from '../controllers/checkLaboratoryEmailsController';
import { basicAuthCheck } from '../middlewares/checks/authCheck';

export const m2mProtectedRouter = express.Router();

m2mProtectedRouter.use(basicAuthCheck);
m2mProtectedRouter.use('/checkLaboratoryEmails', checkLaboratoryEmails);
