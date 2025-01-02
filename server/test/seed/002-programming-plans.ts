import { genProgrammingPlan } from '../../../shared/test/programmingPlanFixtures';
import { ProgrammingPlans } from '../../repositories/programmingPlanRepository';
import { NationalCoordinator } from './001-users';

export const ValidatedProgrammingPlanFixture = genProgrammingPlan({
  createdBy: NationalCoordinator.id,
  createdAt: new Date('2024-01-01'),
  id: '11111111-1111-1111-1111-111111111111',
  status: 'Validated',
  year: 2024
});

export const seed = async (): Promise<void> => {
  await ProgrammingPlans().insert(ValidatedProgrammingPlanFixture);
};
