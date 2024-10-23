import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import { FindProgrammingPlanOptions } from '../../shared/schema/ProgrammingPlan/FindProgrammingPlanOptions';
import programmingPlanRepository from '../repositories/programmingPlanRepository';

const findProgrammingPlans = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;
  const findOptions = request.query as FindProgrammingPlanOptions;

  console.info('Find programmingPlans for user', user.id, findOptions);

  const programmingPlans = await programmingPlanRepository.findMany(
    findOptions
  );

  console.info('Found programmingPlans', programmingPlans);

  response.status(constants.HTTP_STATUS_OK).send(programmingPlans);
};

export default {
  findProgrammingPlans,
};
