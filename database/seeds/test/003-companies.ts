import { Companies } from '../../../server/repositories/companyRepository';
import { genCompany } from '../../../shared/test/testFixtures';

export const CompanyFixture = genCompany();

exports.seed = async function () {
  await Companies().insert(CompanyFixture);
};
