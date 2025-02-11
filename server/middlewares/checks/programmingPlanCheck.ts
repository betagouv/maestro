import { NextFunction, Request, Response } from 'express';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';

export const programmingPlanCheck =
  () => async (request: Request, response: Response, next: NextFunction) => {
    const programmingPlanId =
      request.params?.programmingPlanId ||
      request.query?.programmingPlanId ||
      request.body?.programmingPlanId;

    const programmingPlan =
      await programmingPlanRepository.findUnique(programmingPlanId);

    if (!programmingPlan) {
      throw new ProgrammingPlanMissingError(programmingPlanId);
    }

    request.programmingPlan = programmingPlan;

    next();
  };
