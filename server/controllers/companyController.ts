import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { FindCompanyOptions } from '../../shared/schema/Company/FindCompanyOptions';
import companyRepository from '../repositories/companyRepository';

const findCompanies = async (request: Request, response: Response) => {
  const { user } = request as AuthenticatedRequest;
  const findOptions = request.query as FindCompanyOptions;

  console.info('Find companies for user', user.id, findOptions);

  const companies = await companyRepository.findMany(findOptions);

  response.status(constants.HTTP_STATUS_OK).send(companies);
};

export default {
  findCompanies,
};
