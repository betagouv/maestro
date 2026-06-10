import { CAP29Id } from '../schema/User/User';
import {
  DAOAVolailleValidatedSubPlanId,
  PPVValidatedSubPlanId
} from './programmingPlanFixtures';
import { AdminFixture } from './userFixtures';

export const DAOALaboratoryAgreementFixture = {
  programmingSubPlanId: DAOAVolailleValidatedSubPlanId,
  laboratoryId: CAP29Id,
  substanceKind: 'Multi'
};

export const LaboratoryAgreementCheckFixture = {
  programmingSubPlanId: PPVValidatedSubPlanId,
  substanceKind: 'Any'
};

export const LaboratoryAgreementCheckSeedFixture = {
  ...LaboratoryAgreementCheckFixture,
  checkedBy: AdminFixture.id,
  checkedAt: new Date()
};
