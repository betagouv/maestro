import express from 'express';
import userController from '../controllers/userController';
import validator, { uuidParam } from '../middlewares/validator';

const router = express.Router();

router.get(
  '/:userId/infos',
  validator.validate(uuidParam('userId')),
  userController.getUserInfos
);

export default router;
