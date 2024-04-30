import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import { ProgrammingPlanStatus } from '../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import programmingPlanRepository from '../repositories/programmingPlanRepository';

export const programmingPlanCheck =
  (status?: ProgrammingPlanStatus) =>
  async (request: Request, response: Response, next: NextFunction) => {
    const programmingPlanId = request.params.programmingPlanId;

    const programmingPlan = await programmingPlanRepository.findUnique(
      programmingPlanId
    );

    if (!programmingPlan) {
      return response.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
    }
    if (status && programmingPlan.status !== status) {
      return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }
    next();
  };
