import { v4 as uuidv4 } from 'uuid';
import { RegionList } from '../referential/Region';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from '../schema/ProgrammingPlan/ProgrammingPlans';
import {
  type ProgrammingSubPlan,
  ProgrammingSubPlanId
} from '../schema/ProgrammingPlan/ProgrammingSubPlan';
import { oneOf } from './testFixtures';

const NationalCoordinatorId = '55555555-5555-5555-5555-555555555555';

const PPVClosedProgrammingPlanId = 'f5d510ef-ab78-449a-acd6-392895a1994f';
const PPVValidatedProgrammingPlanId = 'd78fb3eb-1998-482b-9014-282d51ae30b8';
const PPVValidatedDromProgrammingPlanId =
  'c9e8a1b2-9c3d-4f0e-9c5a-1a2b3c4d5e6f';
const PPVInProgressProgrammingPlanId = 'bac693a5-9475-4e24-a775-5532b0117e5b';
const PPVSubmittedProgrammingPlanId = 'e7c8a1b2-9c3d-4f0e-9c5a-1a2b3c4d5e6f';
const DAOAValidatedProgrammingPlanId = 'd2680960-a3b5-4091-a87b-e4c2467077fb';
const DAOAInProgressProgrammingPlanId = 'fafc6f2e-aec5-4998-adeb-84090d971a90';

export const PPVValidatedSubPlanId = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'
);
const PPVValidatedDromSubPlanId = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a5'
);
export const PPVClosedSubPlanId = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a2'
);
export const PPVInProgressSubPlanId = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a3'
);
const PPVSubmittedSubPlanId = ProgrammingSubPlanId.parse(
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a4'
);
export const DAOAVolailleValidatedSubPlanId = ProgrammingSubPlanId.parse(
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'
);
export const DAOABovinValidatedSubPlanId = ProgrammingSubPlanId.parse(
  'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3'
);
export const DAOAInProgressVolailleSubPlanId = ProgrammingSubPlanId.parse(
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b4'
);
export const DAOAInProgressBovinSubPlanId = ProgrammingSubPlanId.parse(
  'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c4'
);

export const SachaSubPlanIds = [
  DAOAVolailleValidatedSubPlanId,
  DAOABovinValidatedSubPlanId,
  DAOAInProgressVolailleSubPlanId,
  DAOAInProgressBovinSubPlanId
];

export const genProgrammingSubPlan = (
  data?: Partial<ProgrammingSubPlan>
): ProgrammingSubPlan => ({
  id: ProgrammingSubPlanId.parse(uuidv4()),
  programmingPlanId: uuidv4(),
  subPlanNumber: 'TEST',
  stages: [],
  label: 'Test SubPlan',
  withSacha: (data?.id && SachaSubPlanIds.includes(data.id)) ?? false,
  substanceKinds: ['Any'],
  nationalStatus: oneOf(ProgrammingPlanStatusList),
  regionalStatus: RegionList.map((region) => ({
    region,
    status: oneOf(ProgrammingPlanStatusList)
  })),
  departmentalStatus: [],
  ...data
});

export const PPVValidatedSubPlanFixture = genProgrammingSubPlan({
  id: PPVValidatedSubPlanId,
  programmingPlanId: PPVValidatedProgrammingPlanId,
  subPlanNumber: 'PPV',
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
  withSacha: false,
  substanceKinds: ['Any']
});
export const PPVValidatedDromSubPlanFixture = genProgrammingSubPlan({
  ...PPVValidatedSubPlanFixture,
  id: PPVValidatedDromSubPlanId,
  programmingPlanId: PPVValidatedDromProgrammingPlanId,
  label: 'Production primaire végétale - DROM'
});

export const PPVClosedSubPlanFixture = genProgrammingSubPlan({
  ...PPVValidatedSubPlanFixture,
  id: PPVClosedSubPlanId,
  programmingPlanId: PPVClosedProgrammingPlanId
});

export const PPVInProgressSubPlanFixture = genProgrammingSubPlan({
  ...PPVValidatedSubPlanFixture,
  id: PPVInProgressSubPlanId,
  programmingPlanId: PPVInProgressProgrammingPlanId
});

export const PPVSubmittedSubPlanFixture = genProgrammingSubPlan({
  ...PPVValidatedSubPlanFixture,
  id: PPVSubmittedSubPlanId,
  programmingPlanId: PPVSubmittedProgrammingPlanId
});

export const DAOAVolailleValidatedSubPlanFixture = genProgrammingSubPlan({
  id: DAOAVolailleValidatedSubPlanId,
  programmingPlanId: DAOAValidatedProgrammingPlanId,
  subPlanNumber: 'M01',
  stages: ['STADE10'],
  label: 'Abattoir / Viande de volaille',
  analysisPermissionRole: 'DepartmentalCoordinator',
  contactListId: 9,
  withSacha: true,
  substanceKinds: ['Mono', 'Multi', 'Copper']
});

export const DAOAVolailleInProgressSubPlanFixture = genProgrammingSubPlan({
  ...DAOAVolailleValidatedSubPlanFixture,
  id: DAOAInProgressVolailleSubPlanId,
  programmingPlanId: DAOAInProgressProgrammingPlanId
});

export const DAOABovinValidatedSubPlanFixture = genProgrammingSubPlan({
  id: DAOABovinValidatedSubPlanId,
  programmingPlanId: DAOAValidatedProgrammingPlanId,
  subPlanNumber: 'M02',
  stages: ['STADE10'],
  label: 'Abattoir / Foie de bovin',
  analysisPermissionRole: 'DepartmentalCoordinator',
  contactListId: 9,
  withSacha: true,
  substanceKinds: ['Mono', 'Multi', 'Copper']
});

export const DAOABovinInProgressSubPlanFixture = genProgrammingSubPlan({
  ...DAOABovinValidatedSubPlanFixture,
  id: DAOAInProgressBovinSubPlanId,
  programmingPlanId: DAOAInProgressProgrammingPlanId
});

export const genProgrammingPlan = (
  data?: Partial<ProgrammingPlanChecked>
): ProgrammingPlanChecked => {
  const planId = data?.id ?? uuidv4();
  return {
    id: planId,
    domain: 'PESTICIDE_RESIDUE',
    title: 'Production primaire végétale',
    subPlanIds: [ProgrammingSubPlanId.parse(uuidv4())],
    distributionKind: 'REGIONAL',
    contexts: ['Control', 'Surveillance'],
    legalContexts: ['A', 'B'],
    samplesOutsidePlanAllowed: true,
    createdAt: new Date(),
    createdBy: uuidv4(),
    year: new Date().getFullYear(),
    ...data
  };
};

export const PPVClosedProgrammingPlanFixture = genProgrammingPlan({
  id: PPVClosedProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: 'Production primaire végétale',
  subPlanIds: [PPVClosedSubPlanFixture.id],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  closedAt: new Date(),
  closedBy: NationalCoordinatorId,
  year: new Date().getFullYear() - 1
});

export const PPVValidatedProgrammingPlanFixture = genProgrammingPlan({
  id: PPVValidatedProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: 'Production primaire végétale',
  subPlanIds: [PPVValidatedSubPlanFixture.id],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  year: new Date().getFullYear()
});

export const PPVValidatedDromProgrammingPlanFixture = genProgrammingPlan({
  id: PPVValidatedDromProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: 'Production primaire végétale - DROM',
  subPlanIds: [PPVValidatedDromSubPlanFixture.id],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  year: new Date().getFullYear() + 10
});

export const PPVInProgressProgrammingPlanFixture = genProgrammingPlan({
  id: PPVInProgressProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: 'Production primaire végétale',
  subPlanIds: [PPVInProgressSubPlanFixture.id],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  year: new Date().getFullYear() + 1
});

export const PPVSubmittedProgrammingPlanFixture = genProgrammingPlan({
  id: PPVSubmittedProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: 'Production primaire végétale',
  subPlanIds: [PPVSubmittedSubPlanFixture.id],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  year: new Date().getFullYear() + 2
});

export const DAOAValidatedProgrammingPlanFixture = genProgrammingPlan({
  id: DAOAValidatedProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: "Produit carné à l'abattoir",
  subPlanIds: [
    DAOAVolailleValidatedSubPlanFixture.id,
    DAOABovinValidatedSubPlanFixture.id
  ],
  distributionKind: 'SLAUGHTERHOUSE',
  contexts: ['Surveillance'],
  legalContexts: ['A'],
  samplesOutsidePlanAllowed: false,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  year: new Date().getFullYear()
});

export const DAOAInProgressProgrammingPlanFixture = genProgrammingPlan({
  id: DAOAInProgressProgrammingPlanId,
  domain: 'PESTICIDE_RESIDUE',
  title: "Produit carné à l'abattoir",
  subPlanIds: [
    DAOAVolailleInProgressSubPlanFixture.id,
    DAOABovinInProgressSubPlanFixture.id
  ],
  distributionKind: 'SLAUGHTERHOUSE',
  contexts: ['Surveillance'],
  legalContexts: ['A'],
  samplesOutsidePlanAllowed: false,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  year: new Date().getFullYear() + 1
});
