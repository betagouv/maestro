import { Companies } from '../../repositories/companyRepository';
import { CompanyFixture } from '../../../shared/test/companyFixtures';

export const seed = async (): Promise<void> => {
  await Companies().insert(CompanyFixture);
};
