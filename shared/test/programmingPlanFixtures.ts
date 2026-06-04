import { v4 as uuidv4 } from 'uuid';
import { RegionList, Regions } from '../referential/Region';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from '../schema/ProgrammingPlan/ProgrammingPlans';
import type { ProgrammingSubPlan } from '../schema/ProgrammingPlan/ProgrammingSubPlan';
import { ProgrammingSubPlanId } from '../schema/ProgrammingPlan/ProgrammingSubPlan';
import { oneOf } from './testFixtures';
import { NationalCoordinator } from './userFixtures';

const PPVClosedProgrammingPlanId = 'f5d510ef-ab78-449a-acd6-392895a1994f';
const PPVValidatedProgrammingPlanId = 'd78fb3eb-1998-482b-9014-282d51ae30b8';
const PPVInProgressProgrammingPlanId = 'bac693a5-9475-4e24-a775-5532b0117e5b';
const DAOAValidatedProgrammingPlanId = 'd2680960-a3b5-4091-a87b-e4c2467077fb';
const DAOAInProgressProgrammingPlanId = 'fafc6f2e-aec5-4998-adeb-84090d971a90';

export const PPVSubPlanId = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'
);
export const PPVClosedSubPlanId = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2'
);
export const PPVInProgressSubPlanId = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3'
);
export const DAOAVolailleSubPlanId = ProgrammingSubPlanId.parse(
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'
);
export const DAOABovinSubPlanId = ProgrammingSubPlanId.parse(
  'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3'
);
export const DAOAInProgressVolailleSubPlanId = ProgrammingSubPlanId.parse(
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b4'
);
export const DAOAInProgressBovinSubPlanId = ProgrammingSubPlanId.parse(
  'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c4'
);

export const TestPPVSubPlanId1 = ProgrammingSubPlanId.parse(
  'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d1'
);
export const TestPPVSubPlanId2 = ProgrammingSubPlanId.parse(
  'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d2'
);
export const TestPPVSubPlanId3 = ProgrammingSubPlanId.parse(
  'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d3'
);
export const TestPPVSubPlanId4 = ProgrammingSubPlanId.parse(
  'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4'
);

export const PPVSubPlanFixture: ProgrammingSubPlan = {
  id: PPVSubPlanId,
  programmingPlanId: PPVValidatedProgrammingPlanId,
  codeNat: 'PPV',
  stages: [
    'STADE1',
    'STADE2',
    'STADE3',
    'STADE4',
    'STADE5',
    'STADE6',
    'STADE7',
    'STADE8',
    'STADE9'
  ],
  label: 'Production primaire végétale',
  analysisPermissionRole: 'Sampler',
  contactListId: 7,
  withSacha: false
};

const DAOAVolailleSubPlanFixture: ProgrammingSubPlan = {
  id: DAOAVolailleSubPlanId,
  programmingPlanId: DAOAValidatedProgrammingPlanId,
  codeNat: 'M01',
  stages: ['STADE10'],
  label: 'Abattoir / Viande de volaille',
  analysisPermissionRole: 'DepartmentalCoordinator',
  contactListId: 9,
  withSacha: true
};

export const DAOABovinSubPlanFixture: ProgrammingSubPlan = {
  id: DAOABovinSubPlanId,
  programmingPlanId: DAOAValidatedProgrammingPlanId,
  codeNat: 'M02',
  stages: ['STADE10'],
  label: 'Abattoir / Foie de bovin',
  analysisPermissionRole: 'DepartmentalCoordinator',
  contactListId: 9,
  withSacha: true
};

export const genProgrammingPlan = (
  data?: Partial<ProgrammingPlanChecked>
): ProgrammingPlanChecked => {
  const planId = data?.id ?? uuidv4();
  return {
    id: planId,
    domain: 'PESTICIDE_RESIDUE',
    title: 'Production primaire végétale',
    subPlans: [
      {
        ...PPVSubPlanFixture,
        id: ProgrammingSubPlanId.parse(uuidv4()),
        programmingPlanId: planId
      }
    ],
    distributionKind: 'REGIONAL',
    contexts: ['Control', 'Surveillance'],
    legalContexts: ['A', 'B'],
    substanceKinds: ['Any'],
    samplesOutsidePlanAllowed: true,
    createdAt: new Date(),
    createdBy: uuidv4(),
    regionalStatus: RegionList.map((region) => ({
      region,
      status: oneOf(ProgrammingPlanStatusList)
    })),
    departmentalStatus: [],
    year: new Date().getFullYear(),
    ...data
  };
};

export const PPVClosedProgrammingPlanFixture = genProgrammingPlan({
  id: PPVClosedProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: 'Production primaire végétale',
  subPlans: [
    {
      ...PPVSubPlanFixture,
      id: PPVClosedSubPlanId,
      programmingPlanId: PPVClosedProgrammingPlanId
    }
  ],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  substanceKinds: ['Any'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinator.id,
  closedAt: new Date(),
  closedBy: NationalCoordinator.id,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Closed'
  })),
  year: new Date().getFullYear() - 1
});

export const PPVValidatedProgrammingPlanFixture = genProgrammingPlan({
  id: PPVValidatedProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: 'Production primaire végétale',
  subPlans: [PPVSubPlanFixture],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  substanceKinds: ['Any'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinator.id,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Validated'
  })),
  year: new Date().getFullYear()
});

export const PPVInProgressProgrammingPlanFixture = genProgrammingPlan({
  id: PPVInProgressProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: 'Production primaire végétale',
  subPlans: [
    {
      ...PPVSubPlanFixture,
      id: PPVInProgressSubPlanId,
      programmingPlanId: PPVInProgressProgrammingPlanId
    }
  ],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  substanceKinds: ['Any'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinator.id,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'InProgress'
  })),
  year: new Date().getFullYear() + 1
});

export const DAOAValidatedProgrammingPlanFixture = genProgrammingPlan({
  id: DAOAValidatedProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: "Produit carné à l'abattoir",
  subPlans: [DAOAVolailleSubPlanFixture, DAOABovinSubPlanFixture],
  distributionKind: 'SLAUGHTERHOUSE',
  contexts: ['Surveillance'],
  legalContexts: ['A'],
  substanceKinds: ['Mono', 'Multi', 'Copper'],
  samplesOutsidePlanAllowed: false,
  createdAt: new Date(),
  createdBy: NationalCoordinator.id,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Validated'
  })),
  departmentalStatus: RegionList.flatMap((region) =>
    Regions[region].departments.map((department) => ({
      region,
      department,
      status: 'Validated'
    }))
  ),
  year: new Date().getFullYear()
});

export const DAOAInProgressProgrammingPlanFixture = genProgrammingPlan({
  id: DAOAInProgressProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: "Produit carné à l'abattoir",
  subPlans: [
    {
      ...DAOAVolailleSubPlanFixture,
      id: DAOAInProgressVolailleSubPlanId,
      programmingPlanId: DAOAInProgressProgrammingPlanId
    },
    {
      ...DAOABovinSubPlanFixture,
      id: DAOAInProgressBovinSubPlanId,
      programmingPlanId: DAOAInProgressProgrammingPlanId
    }
  ],
  distributionKind: 'SLAUGHTERHOUSE',
  contexts: ['Surveillance'],
  legalContexts: ['A'],
  substanceKinds: ['Mono', 'Multi', 'Copper'],
  samplesOutsidePlanAllowed: false,
  createdAt: new Date(),
  createdBy: NationalCoordinator.id,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'InProgress'
  })),
  year: new Date().getFullYear() + 1
});
