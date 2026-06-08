import express from 'express';
import { checkLaboratoryEmails } from '../controllers/checkLaboratoryEmailsController';
import { basicAuthCheck } from '../middlewares/checks/authCheck';
import config from '../utils/config';

export const m2mProtectedRouter = express.Router();

m2mProtectedRouter.use(basicAuthCheck(config.m2mBasicToken));
m2mProtectedRouter.use('/checkLaboratoryEmails', checkLaboratoryEmails);
