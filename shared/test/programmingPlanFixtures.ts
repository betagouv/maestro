import { v4 as uuidv4 } from 'uuid';
import { RegionList } from '../referential/Region';
import { ProgrammingPlanContextList } from '../schema/ProgrammingPlan/Context';
import { ProgrammingPlan } from '../schema/ProgrammingPlan/ProgrammingPlans';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import { oneOf } from './testFixtures';
import { NationalCoordinator } from './userFixtures';

export const genProgrammingPlan = (
  data?: Partial<ProgrammingPlan>
): ProgrammingPlan => ({
  id: uuidv4(),
  kinds: ['PPV'],
  contexts: [oneOf(ProgrammingPlanContextList)],
  createdAt: new Date(),
  createdBy: uuidv4(),
  regionalStatus: RegionList.map((region) => ({
    region,
    status: oneOf(ProgrammingPlanStatusList)
  })),
  year: new Date().getFullYear(),
  ...data
});
export const ValidatedProgrammingPlanFixture = genProgrammingPlan({
  createdBy: NationalCoordinator.id,
  createdAt: new Date('2024-01-01'),
  id: '11111111-1111-1111-1111-111111111111',
  kinds: ['PPV'],
  contexts: ['Control', 'Surveillance'],
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Validated'
  })),
  year: 2024
});
