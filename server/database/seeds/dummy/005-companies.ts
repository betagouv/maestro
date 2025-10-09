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
      siret: '41483410100019',
      name: 'VALLEGRAIN ABATTOIR',
      tradeName: 'VALLEGRAIN ABATTOIR',
      address: '33 RUE DE LA 2EME DB',
      postalCode: '72170',
      city: 'CHERANCE',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    },
    {
      siret: '50851378500115',
      name: 'SOCOPA VIANDES',
      tradeName: 'SOCOPA VIANDES',
      address: 'LES BORDES CHERRE 3613 RTE DU MANS',
      postalCode: '72400',
      city: 'CHERRE AU',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    },
    {
      siret: '54695037900273',
      name: 'CHARAL',
      tradeName: 'CHARAL',
      address: 'AV JEAN MONNET',
      postalCode: '72300',
      city: 'SABLE SUR SARTHE',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    },
    {
      siret: '87912629000011',
      name: 'NEVEU SOPHIE',
      tradeName: 'NEVEU SOPHIE',
      address: 'LA HAIE',
      postalCode: '72400',
      city: 'VILLAINES-LA-GONAIS',
      nafCode: '10.11A',
      kind: 'Slaughterhouse'
    }
  ]);
};
