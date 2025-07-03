import { NextFunction, Request, Response } from 'express';
import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';

export const programmingPlanCheck =
  () => async (request: Request, _response: Response, next: NextFunction) => {
    const programmingPlanId =
      request.params?.programmingPlanId ||
      request.query?.programmingPlanId ||
      request.body?.programmingPlanId;

    request.programmingPlan =
      await getAndCheckProgrammingPlan(programmingPlanId);

    next();
  };
export const getAndCheckProgrammingPlan = async (programmingPlanId: string) => {
  const programmingPlan =
    await programmingPlanRepository.findUnique(programmingPlanId);

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(programmingPlanId);
  }

  return programmingPlan;
};
