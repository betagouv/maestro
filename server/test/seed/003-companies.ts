import { genCompany } from '../../../shared/test/companyFixtures';
import { Companies } from '../../repositories/companyRepository';

export const CompanyFixture = genCompany({
  siret: '11111111111111',
  name: 'Company 1',
  address: '1 rue de la Paix',
  postalCode: '75000'
});

export const seed = async (): Promise<void> => {
  await Companies().insert(CompanyFixture);
};
