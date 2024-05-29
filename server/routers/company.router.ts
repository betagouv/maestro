import express from 'express';
import { FindCompanyOptions } from '../../shared/schema/Company/FindCompanyOptions';
import companyController from '../controllers/companyController';
import { permissionsCheck } from '../middlewares/checks/authCheck';
import validator, { query } from '../middlewares/validator';

const router = express.Router();

router.get(
  '',
  validator.validate(query(FindCompanyOptions)),
  permissionsCheck(['readCompanies']),
  companyController.findCompanies
);

export default router;
