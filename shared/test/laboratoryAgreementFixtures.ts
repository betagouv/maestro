import { CAP29Id } from '../schema/User/User';
import { DAOAVolailleSubPlanId, PPVSubPlanId } from './programmingPlanFixtures';
import { AdminFixture } from './userFixtures';

export const DAOALaboratoryAgreementFixture = {
  programmingSubPlanId: DAOAVolailleSubPlanId,
  laboratoryId: CAP29Id,
  substanceKind: 'Multi'
};

export const LaboratoryAgreementCheckFixture = {
  programmingSubPlanId: PPVSubPlanId,
  substanceKind: 'Any'
};

export const LaboratoryAgreementCheckSeedFixture = {
  ...LaboratoryAgreementCheckFixture,
  checkedBy: AdminFixture.id,
  checkedAt: new Date()
};
