import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { NationalCoordinator } from './001-users';

export const ProgrammingPlanFixture = genProgrammingPlan({
  createdBy: NationalCoordinator.id,
  id: '11111111-1111-1111-1111-111111111111',
});

exports.seed = async function () {
  await ProgrammingPlans().insert(ProgrammingPlanFixture);
};
