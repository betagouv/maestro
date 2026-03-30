import { PPVDummyLaboratoryIds } from 'maestro-shared/schema/User/User';
import { LaboratoryFixture } from 'maestro-shared/test/laboratoryFixtures';
import { PPVValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { knexInstance as db } from '../../repositories/db';

export const seed = async (): Promise<void> => {
  await db('laboratory_agreements').insert(
    [...PPVDummyLaboratoryIds, LaboratoryFixture.id].map((laboratoryId) => ({
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      laboratoryId,
      substanceKind: 'Any'
    }))
  );
};
