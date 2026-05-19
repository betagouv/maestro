import { LaboratoryFixture } from './laboratoryFixtures';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from './programmingPlanFixtures';
import { AdminFixture } from './userFixtures';

export const DAOALaboratoryAgreementFixture = {
  programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
  programmingPlanKind: 'DAOA_VOLAILLE' as const,
  laboratoryId: LaboratoryFixture.id,
  substanceKind: 'Multi' as const
};

export const LaboratoryAgreementCheckFixture = {
  programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
  programmingPlanKind: 'PPV' as const,
  substanceKind: 'Any' as const
};

export const LaboratoryAgreementCheckSeedFixture = {
  ...LaboratoryAgreementCheckFixture,
  checkedBy: AdminFixture.id,
  checkedAt: new Date()
};
