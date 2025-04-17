import { Companies } from '../../../repositories/companyRepository';

export const seed = async function () {
  await Companies().insert([
    {
      siret: '77560611400061',
      name: 'APEI OUEST 44',
      tradeName: 'ESAT OCEANIS',
      address: 'ESAT OCEANIS',
      postalCode: '44600',
      city: 'Saint-Nazaire',
      department: '44',
      nafCode: '88.10C'
    },
    {
      siret: '84159600000015',
      name: 'BIO POUSS',
      tradeName: 'BIO POUSS',
      address: '120 ROUTE DE BEAU SOLEIL',
      postalCode: '44470',
      city: 'Mauves-sur-Loire',
      department: '44',
      nafCode: '01.50Z'
    },
    {
      siret: '44876439900011',
      name: 'EARL ATLANTIC PEPINIERE',
      tradeName: 'EARL ATLANTIC PEPINIERE',
      address: 'LES CHAILLEREAUX',
      postalCode: '44260',
      city: 'Malville',
      department: '44',
      nafCode: '01.30Z'
    }
  ]);
};
