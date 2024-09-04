import { Companies } from '../../../server/repositories/companyRepository';
import { genCompany } from '../../../shared/test/companyFixtures';

export const CompanyFixture = genCompany({
  siret: '11111111111111',
  name: 'Company 1',
  address: '1 rue de la Paix',
  postalCode: '75000',
});

exports.seed = async function () {
  await Companies().insert(CompanyFixture);
};
