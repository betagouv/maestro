import { LaboratoryAgreementCheckSeedFixture } from 'maestro-shared/test/laboratoryAgreementFixtures';
import { knexInstance as db } from '../../repositories/db';

export const seed = async (): Promise<void> => {
  await db('laboratory_agreement_checks').insert(
    LaboratoryAgreementCheckSeedFixture
  );
};
