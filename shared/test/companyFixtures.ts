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
  postalCode: '87000'
});

export const SlaughterhouseCompanyFixture = genCompany({
  siret: '22222222222222',
  name: 'Slaughterhouse Company',
  address: '2 avenue des Champs',
  postalCode: '69000',
  kind: 'Slaughterhouse'
});
