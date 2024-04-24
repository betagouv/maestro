import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'express-jwt';
import { constants } from 'http2';
import programmingPlanRepository from '../repositories/programmingPlanRepository';

const getProgrammingPlan = async (request: Request, response: Response) => {
  const { programmingPlanId } = request.params;

  console.info('Get programmingPlan', programmingPlanId);

  const programmingPlan = await programmingPlanRepository.findUnique(
    programmingPlanId
  );

  if (!programmingPlan) {
    return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
  }

  response.status(constants.HTTP_STATUS_OK).send(programmingPlan);
};

const findProgrammingPlans = async (request: Request, response: Response) => {
  const user = (request as AuthenticatedRequest).user;

  console.info('Find programmingPlans for user', user.id);

  const programmingPlans = await programmingPlanRepository.findMany(
    user.region ?? undefined
  );

  response.status(constants.HTTP_STATUS_OK).send(programmingPlans);
};

export default {
  getProgrammingPlan,
  findProgrammingPlans,
};
