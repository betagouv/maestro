import { ValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import {
  formatProgrammingPlan,
  ProgrammingPlans
} from '../../repositories/programmingPlanRepository';

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(
    formatProgrammingPlan(ValidatedProgrammingPlanFixture)
  );
};
