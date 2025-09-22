import ProgrammingPlanMissingError from 'maestro-shared/errors/programmingPlanMissingError';
import programmingPlanRepository from '../../repositories/programmingPlanRepository';

export const getAndCheckProgrammingPlan = async (programmingPlanId: string) => {
  const programmingPlan =
    await programmingPlanRepository.findUnique(programmingPlanId);

  if (!programmingPlan) {
    throw new ProgrammingPlanMissingError(programmingPlanId);
  }

  return programmingPlan;
};
