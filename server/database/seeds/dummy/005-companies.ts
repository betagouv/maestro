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
      nafCode: '88.10C'
    },
    {
      siret: '84159600000015',
      name: 'BIO POUSS',
      tradeName: 'BIO POUSS',
      address: '120 ROUTE DE BEAU SOLEIL',
      postalCode: '44470',
      city: 'Mauves-sur-Loire',
      nafCode: '01.50Z'
    },
    {
      siret: '44876439900011',
      name: 'EARL ATLANTIC PEPINIERE',
      tradeName: 'EARL ATLANTIC PEPINIERE',
      address: 'LES CHAILLEREAUX',
      postalCode: '44260',
      city: 'Malville',
      nafCode: '01.30Z'
    },
    {
      siret: '88888906000032',
      name: 'ARCADIE VIANDES',
      tradeName: 'ARCADIE VIANDES',
      address: 'RUE DU LAZARET',
      postalCode: '64600',
      city: 'ANGLET',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    },
    {
      siret: '33817288500067',
      name: 'FIPSO INDUSTRIE',
      tradeName: 'FIPSO INDUSTRIE',
      address: 'RTE DE BELLOCQ',
      postalCode: '64270',
      city: 'LAHONTAN',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    },
    {
      siret: '78939445900018',
      name: "ABATTOIR D'OSSAU",
      tradeName: "ABATTOIR D'OSSAU",
      address: '240 RTE DEPARTEMENTALE',
      postalCode: '64440',
      city: 'LOUVIE SOUBIRON',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    },
    {
      siret: '34806742200017',
      name: 'ABATTOIRS DU PAYS DE SOULE',
      tradeName: 'ABATTOIRS DU PAYS DE SOULE',
      address: '37 AV BELZUNCE',
      postalCode: '64130',
      city: 'MAULEON LICHARRE',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    },
    {
      siret: '79021191600016',
      name: 'ABATTOIR DU HAUT BEARN',
      tradeName: 'ABATTOIR DU HAUT BEARN',
      address: 'AV DU QUATRE SEPTEMBRE',
      postalCode: '64400',
      city: 'OLORON STE MARIE',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    },
    {
      siret: '25640368400010',
      name: 'SI AMENAGEMENT GESTION ABATTOIR SAINT JEAN PIED DE PORT',
      tradeName: 'SI AMENAGEMENT GESTION ABATTOIR SAINT JEAN PIED DE PORT',
      address: 'MAIRIE 13 PL CHARLES DE GAULLE',
      postalCode: '64220',
      city: 'ST JEAN PIED DE PORT',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    }
  ]);
};
