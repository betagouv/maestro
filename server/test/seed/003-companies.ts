import { Companies } from '../../repositories/companyRepository';
import { CompanyFixture } from 'maestro-shared/test/companyFixtures';

export const seed = async (): Promise<void> => {
  await Companies().insert(CompanyFixture);
};
