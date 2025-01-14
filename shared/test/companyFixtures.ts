import { fakerFR as faker, fakerFR } from '@faker-js/faker';
import { RegionList, Regions } from '../referential/Region';
import { Company } from '../schema/Company/Company';
import { CompanySearchResult } from '../schema/Company/CompanySearchResult';
import { genSiret, oneOf } from './testFixtures';

export const genCompany = (data?: Partial<Company>): Company => ({
  siret: genSiret(),
  name: fakerFR.company.name(),
  address: faker.location.streetAddress({ useFullAddress: true }),
  postalCode: faker.location.zipCode(),
  ...data
});

export const genCompanySearchResult = (): CompanySearchResult => ({
  siren: genSiret().substring(0, 9),
  nom_complet: fakerFR.company.name(),
  nom_raison_sociale: fakerFR.company.name(),
  sigle: fakerFR.company.buzzNoun(),
  siege: {
    activite_principale: fakerFR.commerce.department(),
    adresse: fakerFR.location.streetAddress(),
    code_postal: fakerFR.location.zipCode(),
    commune: fakerFR.location.city(),
    complement_adresse: fakerFR.location.secondaryAddress(),
    departement: oneOf(Regions['44'].departments),
    libelle_commune: fakerFR.location.city(),
    libelle_voie: fakerFR.location.street(),
    numero_voie: fakerFR.location.buildingNumber(),
    region: oneOf(RegionList),
    siret: genSiret()
  },
  activite_principale: faker.commerce.department()
});
export const CompanyFixture = genCompany({
  siret: '11111111111111',
  name: 'Company 1',
  address: '1 rue de la Paix',
  postalCode: '75000'
});