import express from 'express';
import { brevoWebhook } from '../controllers/brevoWebhookController';
import { basicAuthCheck } from '../middlewares/checks/authCheck';
import config from '../utils/config';

export const brevoProtectedRouter = express.Router();

brevoProtectedRouter.use(basicAuthCheck(config.mailer.eventApiKey));
brevoProtectedRouter.post('/', brevoWebhook);
