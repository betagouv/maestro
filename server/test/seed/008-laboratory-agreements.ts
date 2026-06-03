import { PPVDummyLaboratoryIds } from 'maestro-shared/schema/User/User';
import { DAOALaboratoryAgreementFixture } from 'maestro-shared/test/laboratoryAgreementFixtures';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { PPVSubPlanId } from 'maestro-shared/test/programmingPlanFixtures';
import { knexInstance as db } from '../../repositories/db';

export const seed = async (): Promise<void> => {
  await db('laboratory_agreements').insert([
    ...[...PPVDummyLaboratoryIds, LaboratoryFixture.id].map((laboratoryId) => ({
      programmingSubPlanId: PPVSubPlanId,
      laboratoryId,
      substanceKind: 'Any'
    })),
    DAOALaboratoryAgreementFixture
  ]);
};
