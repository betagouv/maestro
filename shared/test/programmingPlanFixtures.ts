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

export const PPVClosedProgrammingPlanFixture = genProgrammingPlan({
  id: 'f5d510ef-ab78-449a-acd6-392895a1994f',
  kinds: ['PPV'],
  contexts: ['Control', 'Surveillance'],
  createdAt: new Date(),
  createdBy: NationalCoordinator.id,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Closed'
  })),
  year: new Date().getFullYear() - 1
});

export const PPVValidatedProgrammingPlanFixture = genProgrammingPlan({
  id: 'd78fb3eb-1998-482b-9014-282d51ae30b8',
  kinds: ['PPV'],
  contexts: ['Control', 'Surveillance'],
  createdAt: new Date(),
  createdBy: NationalCoordinator.id,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Validated'
  })),
  year: new Date().getFullYear()
});

export const PFASValidatedProgrammingPlanFixture = genProgrammingPlan({
  id: '95d0f5c9-8a48-4bfb-b896-08aae5a22be3',
  kinds: ['PFAS_EGGS', 'PFAS_MEAT'],
  contexts: ['Control'],
  createdAt: new Date(),
  createdBy: NationalCoordinator.id,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Validated'
  })),
  year: new Date().getFullYear()
});
