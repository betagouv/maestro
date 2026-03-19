import { PPVDummyLaboratoryIds } from 'maestro-shared/schema/User/User';
import { PPVValidatedProgrammingPlanFixture } from 'maestro-shared/test/programmingPlanFixtures';
import { knexInstance as db } from '../../repositories/db';

export const seed = async (): Promise<void> => {
  await db('laboratory_agreements').insert(
    PPVDummyLaboratoryIds.map((laboratoryId) => ({
      programmingPlanId: PPVValidatedProgrammingPlanFixture.id,
      laboratoryId,
      substanceKind: 'Any'
    }))
  );
};
