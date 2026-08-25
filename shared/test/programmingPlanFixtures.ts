import { v4 as uuidv4 } from 'uuid';
import { isDromRegion, RegionList, Regions } from '../referential/Region';
import {
  type ProgrammingPlanDomain,
  ProgrammingPlanDomainId
} from '../schema/ProgrammingPlan/ProgrammingPlanDomain';
import { ProgrammingPlanStatusList } from '../schema/ProgrammingPlan/ProgrammingPlanStatus';
import type { ProgrammingPlanChecked } from '../schema/ProgrammingPlan/ProgrammingPlans';
import {
  type ProgrammingSubPlan,
  ProgrammingSubPlanId
} from '../schema/ProgrammingPlan/ProgrammingSubPlan';
import { oneOf } from './testFixtures';

const currentYear = new Date().getFullYear();

export const PesticideResidueDomainId = ProgrammingPlanDomainId.parse(
  '09a95048-64fe-46a1-8543-50146c6ab337'
);
export const ChemicalContaminantDomainId = ProgrammingPlanDomainId.parse(
  'be1fb96c-e498-4e7a-bd2b-cd3d808f997f'
);
export const PesticideResiduePreviousYearDomainId =
  ProgrammingPlanDomainId.parse('1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d');
const PesticideResidueNextYearDomainId = ProgrammingPlanDomainId.parse(
  '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e'
);
const PesticideResidueInTwoYearsDomainId = ProgrammingPlanDomainId.parse(
  '3c4d5e6f-7a8b-4c9d-8e0f-2a3b4c5d6e7f'
);
const PesticideResidueInTenYearsDomainId = ProgrammingPlanDomainId.parse(
  '4d5e6f7a-8b9c-4d0e-9f1a-3b4c5d6e7f8a'
);

export const genProgrammingPlanDomain = (
  data?: Partial<ProgrammingPlanDomain>
): ProgrammingPlanDomain => ({
  id: ProgrammingPlanDomainId.parse(uuidv4()),
  label: 'Résidus de pesticides',
  year: currentYear,
  ...data
});

export const ProgrammingPlanDomainFixtures: ProgrammingPlanDomain[] = [
  genProgrammingPlanDomain({ id: PesticideResidueDomainId }),
  genProgrammingPlanDomain({
    id: ChemicalContaminantDomainId,
    label: 'Contaminants chimiques'
  }),
  genProgrammingPlanDomain({
    id: PesticideResiduePreviousYearDomainId,
    year: currentYear - 1
  }),
  genProgrammingPlanDomain({
    id: PesticideResidueNextYearDomainId,
    year: currentYear + 1
  }),
  genProgrammingPlanDomain({
    id: PesticideResidueInTwoYearsDomainId,
    year: currentYear + 2
  }),
  genProgrammingPlanDomain({
    id: PesticideResidueInTenYearsDomainId,
    year: currentYear + 10
  })
];

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

const SachaSubPlanIds = [
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
  ...data
});

export const PPVValidatedSubPlanFixture = genProgrammingSubPlan({
  id: PPVValidatedSubPlanId,
  programmingPlanId: PPVValidatedProgrammingPlanId,
  subPlanNumber: 'PPV',
  stages: [
    'PRODUCTION_PRIMAIRE_VEGETALE',
    'ALIMENTATION_ANIMALE',
    'TRANSFORMATION'
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
  stages: ['ABATTAGE'],
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
  stages: ['ABATTAGE'],
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
    domainId: null,
    title: 'Production primaire végétale',
    subPlans: [
      {
        ...PPVValidatedSubPlanFixture,
        id: ProgrammingSubPlanId.parse(uuidv4()),
        programmingPlanId: planId
      }
    ],
    distributionKind: 'REGIONAL',
    contexts: ['Control', 'Surveillance'],
    legalContexts: ['A', 'B'],
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
  domainId: PesticideResiduePreviousYearDomainId,
  title: 'Production primaire végétale',
  subPlans: [PPVClosedSubPlanFixture],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  closedAt: new Date(),
  closedBy: NationalCoordinatorId,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'Closed'
  })),
  year: new Date().getFullYear() - 1
});

export const PPVValidatedProgrammingPlanFixture = genProgrammingPlan({
  id: PPVValidatedProgrammingPlanId,
  domainId: PesticideResidueDomainId,
  title: 'Production primaire végétale',
  subPlans: [PPVValidatedSubPlanFixture],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  regionalStatus: RegionList.toSorted().map((region) => ({
    region,
    status: 'Validated'
  })),
  year: new Date().getFullYear()
});

export const PPVValidatedDromProgrammingPlanFixture = genProgrammingPlan({
  id: PPVValidatedDromProgrammingPlanId,
  domainId: PesticideResidueInTenYearsDomainId,
  title: 'Production primaire végétale - DROM',
  subPlans: [PPVValidatedDromSubPlanFixture],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: isDromRegion(region) ? 'Validated' : 'SubmittedToRegion'
  })),
  year: new Date().getFullYear() + 10
});

export const PPVInProgressProgrammingPlanFixture = genProgrammingPlan({
  id: PPVInProgressProgrammingPlanId,
  domainId: PesticideResidueNextYearDomainId,
  title: 'Production primaire végétale',
  subPlans: [PPVInProgressSubPlanFixture],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'InProgress'
  })),
  year: new Date().getFullYear() + 1
});

export const PPVSubmittedProgrammingPlanFixture = genProgrammingPlan({
  id: PPVSubmittedProgrammingPlanId,
  domainId: PesticideResidueInTwoYearsDomainId,
  title: 'Production primaire végétale',
  subPlans: [PPVSubmittedSubPlanFixture],
  distributionKind: 'REGIONAL',
  contexts: ['Control', 'Surveillance'],
  samplesOutsidePlanAllowed: true,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'SubmittedToRegion'
  })),
  year: new Date().getFullYear() + 2
});

export const DAOAValidatedProgrammingPlanFixture = genProgrammingPlan({
  id: DAOAValidatedProgrammingPlanId,
  domainId: PesticideResidueDomainId,
  title: "Produit carné à l'abattoir",
  subPlans: [
    DAOAVolailleValidatedSubPlanFixture,
    DAOABovinValidatedSubPlanFixture
  ],
  distributionKind: 'SLAUGHTERHOUSE',
  contexts: ['Surveillance'],
  legalContexts: ['A'],
  samplesOutsidePlanAllowed: false,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
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
  domainId: PesticideResidueNextYearDomainId,
  title: "Produit carné à l'abattoir",
  subPlans: [
    DAOAVolailleInProgressSubPlanFixture,
    DAOABovinInProgressSubPlanFixture
  ],
  distributionKind: 'SLAUGHTERHOUSE',
  contexts: ['Surveillance'],
  legalContexts: ['A'],
  samplesOutsidePlanAllowed: false,
  createdAt: new Date(),
  createdBy: NationalCoordinatorId,
  regionalStatus: RegionList.map((region) => ({
    region,
    status: 'InProgress'
  })),
  year: new Date().getFullYear() + 1
});
