import express from 'express';
import { FindUserOptions } from '../../shared/schema/User/FindUserOptions';
import userController from '../controllers/userController';
import validator, { query, uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get(
  '/:userId/infos',
  validator.validate(uuidParam('userId')),
  userController.getUserInfos
);

router.get(
  '/',
  validator.validate(query(FindUserOptions)),
  userController.findUsers
);

export default router;
