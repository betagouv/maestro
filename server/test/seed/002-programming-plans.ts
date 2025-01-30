import { ValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(ValidatedProgrammingPlanFixture);
};
