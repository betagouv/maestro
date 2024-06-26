import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import ProgrammingPlanMissingError from '../../../shared/errors/promgrammingPlanMissingError';
import { ProgrammingPlanStatus } from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';

export const programmingPlanCheck =
  (status?: ProgrammingPlanStatus) =>
  async (request: Request, response: Response, next: NextFunction) => {
    const programmingPlanId = request.params.programmingPlanId;

    const programmingPlan = await programmingPlanRepository.findUnique(
      programmingPlanId
    );

    if (!programmingPlan) {
      throw new ProgrammingPlanMissingError(programmingPlanId);
    }
    if (status && programmingPlan.status !== status) {
      return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    request.programmingPlan = programmingPlan;

    next();
  };
