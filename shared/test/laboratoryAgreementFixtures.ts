import { CAP29Id } from '../schema/User/User';
import {
  DAOAInProgressProgrammingPlanFixture,
  PPVValidatedProgrammingPlanFixture
} from './programmingPlanFixtures';
import { AdminFixture } from './userFixtures';

export const DAOALaboratoryAgreementFixture = {
  programmingPlanId: DAOAInProgressProgrammingPlanFixture.id,
  programmingPlanKind: 'DAOA_VOLAILLE',
  laboratoryId: CAP29Id,
  substanceKind: 'Multi'
};

export const LaboratoryAgreementCheckFixture = {
  programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
  programmingPlanKind: 'PPV',
  substanceKind: 'Any'
};

export const LaboratoryAgreementCheckSeedFixture = {
  ...LaboratoryAgreementCheckFixture,
  checkedBy: AdminFixture.id,
  checkedAt: new Date()
};
