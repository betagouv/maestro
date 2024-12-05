import { NextFunction, Request, Response } from 'express';
import { constants } from 'http2';
import ProgrammingPlanMissingError from '../../../shared/errors/programmingPlanMissingError';
import {
  ProgrammingPlanStatus,
  ProgrammingPlanStatusList
} from '../../../shared/schema/ProgrammingPlan/ProgrammingPlanStatus';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';

export const programmingPlanCheck =
  (status?: ProgrammingPlanStatus | ProgrammingPlanStatus[]) =>
  async (request: Request, response: Response, next: NextFunction) => {
    const programmingPlanId =
      request.params?.programmingPlanId ||
      request.query?.programmingPlanId ||
      request.body?.programmingPlanId;

    const programmingPlan =
      await programmingPlanRepository.findUnique(programmingPlanId);

    if (!programmingPlan) {
      throw new ProgrammingPlanMissingError(programmingPlanId);
    }
    const statusArray = status
      ? Array.isArray(status)
        ? status
        : [status]
      : ProgrammingPlanStatusList;
    if (!statusArray.includes(programmingPlan.status)) {
      return response.sendStatus(constants.HTTP_STATUS_FORBIDDEN);
    }

    request.programmingPlan = programmingPlan;

    next();
  };
