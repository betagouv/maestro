import { v4 as uuidv4 } from 'uuid';
import { ProgrammingPlan } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { oneOf } from './testFixtures';
import { NationalCoordinator } from './userFixtures';

export const genProgrammingPlan = (
  data?: Partial<ProgrammingPlan>
): ProgrammingPlan => ({
  id: uuidv4(),
  createdAt: new Date(),
  createdBy: uuidv4(),
  status: oneOf(ProgrammingPlanStatusList),
  statusDrom: oneOf(ProgrammingPlanStatusList),
  year: new Date().getFullYear(),
  ...data
});
export const ValidatedProgrammingPlanFixture = genProgrammingPlan({
  createdBy: NationalCoordinator.id,
  createdAt: new Date('2024-01-01'),
  id: '11111111-1111-1111-1111-111111111111',
  status: 'Validated',
  year: 2024
});
