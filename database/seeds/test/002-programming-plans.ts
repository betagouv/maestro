import { ProgrammingPlans } from '../../../server/repositories/programmingPlanRepository';
import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { NationalCoordinator } from './001-users';

export const ValidatedProgrammingPlanFixture = genProgrammingPlan({
  createdBy: NationalCoordinator.id,
  createdAt: new Date('2024-01-01'),
  id: '11111111-1111-1111-1111-111111111111',
  status: 'Validated',
  year: 2024,
});

exports.seed = async function () {
  await ProgrammingPlans().insert(ValidatedProgrammingPlanFixture);
};
