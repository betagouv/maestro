import ProgrammingSubPlanMissingError from 'maestro-shared/errors/programmingSubPlanMissingError';
import type { ProgrammingSubPlanId } from 'maestro-shared/schema/ProgrammingPlan/ProgrammingSubPlan';
import { programmingSubPlanRepository } from '../../repositories/programmingSubPlanRepository';

export const getAndCheckProgrammingSubPlan = async (
  programmingSubPlanId: ProgrammingSubPlanId
) => {
  const programmingSubPlan =
    await programmingSubPlanRepository.findUnique(programmingSubPlanId);

  if (!programmingSubPlan) {
    throw new ProgrammingSubPlanMissingError(programmingSubPlanId);
  }

  return programmingSubPlan;
};
