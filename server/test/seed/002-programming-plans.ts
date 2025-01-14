import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { ValidatedProgrammingPlanFixture } from '../../../shared/test/programmingPlanFixtures';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(ValidatedProgrammingPlanFixture);
};
