import express from 'express';
import { updateSevesReference } from '../controllers/sevesController';
import { basicAuthCheck } from '../middlewares/checks/authCheck';
import config from '../utils/config';

export const sevesProtectedRouter = express.Router();

sevesProtectedRouter.use(basicAuthCheck(config.seves.basicToken));
sevesProtectedRouter.put('/update', updateSevesReference);
