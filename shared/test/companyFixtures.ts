import { fakerFR as faker, fakerFR } from '@faker-js/faker';
import { Company } from '../schema/Company/Company';
import { genSiret } from './testFixtures';

export const genCompany = (data?: Partial<Company>): Company => ({
  siret: genSiret(),
  name: fakerFR.company.name(),
  address: faker.location.streetAddress({ useFullAddress: true }),
  postalCode: faker.location.zipCode(),
  ...data
});

export const CompanyFixture = genCompany({
  siret: '11111111111111',
  name: 'Company 1',
  address: '1 rue de la Paix',
  postalCode: '75000'
});
