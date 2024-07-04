import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { genProgrammingPlan } from '../../../shared/test/testFixtures';
import { NationalCoordinator } from './001-users';

export const ProgrammingPlanFixture = genProgrammingPlan(
  NationalCoordinator.id
);

exports.seed = async function () {
  await ProgrammingPlans().insert(ProgrammingPlanFixture);
};
