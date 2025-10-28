import { CompanyKind } from 'maestro-shared/schema/Company/CompanyKind';
import { Companies } from '../../../repositories/companyRepository';
import { knexInstance as db } from '../../../repositories/db';

export const seed = async function () {
  await Companies().insert(
    [
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
        siret: '87912629000011',
        name: 'NEVEU SOPHIE',
        tradeName: 'NEVEU SOPHIE',
        address: 'LA HAIE',
        postalCode: '72400',
        city: 'VILLAINES-LA-GONAIS',
        nafCode: '10.11A',
        kind: 'Slaughterhouse'
      },
      {
        siret: '54695037900216',
        name: 'CHARAL',
        tradeName: 'CHARAL',
        address: 'ZA LE FIEF TARDY 56 RUE DU FIEF TARDY',
        postalCode: '85120',
        city: 'LA CHATAIGNERAIE',
        nafCode: '85.059.002',
        geolocation: {
          y: -0.734475,
          x: 46.642117
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '34447746800120',
        name: 'ELIVIA - SCABEV',
        tradeName: 'ELIVIA - SCABEV',
        address: ' RUE DE L ABATTOIR',
        postalCode: '85500',
        city: 'LES HERBIERS',
        nafCode: '85.109.005',
        geolocation: {
          y: -1.02761,
          x: 46.86651
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '50851378500206',
        name: 'SOCOPA VIANDES',
        tradeName: 'SOCOPA VIANDES',
        address: 'ZA LES AJONCS RTE DE CHOLET',
        postalCode: '85000',
        city: 'LA ROCHE SUR YON',
        nafCode: '85.191.004',
        geolocation: {
          y: -1.372955,
          x: 46.691626
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '92495996800018',
        name: "AVI' VOL",
        tradeName: "AVI' VOL",
        address: '3 LA FORET CHAUCHE',
        postalCode: '85190',
        city: 'AIZENAY',
        nafCode: '85.003.003',
        geolocation: {
          y: -1.716831,
          x: 46.740073
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '51747620600019',
        name: 'FERME DE LA COUARTIERE',
        tradeName: 'FERME DE LA COUARTIERE',
        address: 'LA COUARTIERE',
        postalCode: '85710',
        city: 'BOIS DE CENE',
        nafCode: '85.024.001',
        geolocation: {
          y: -1.896687,
          x: 46.947964
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '45012154600011',
        name: 'SAVIC-FRESLON',
        tradeName: 'SAVIC-FRESLON',
        address: 'ZI DE LA FOLIE',
        postalCode: '85310',
        city: 'LA CHAIZE LE VICOMTE',
        nafCode: '85.046.003',
        geolocation: {
          y: -1.328166,
          x: 46.667725
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '34761115400027',
        name: 'GERARD BURGAUD - LES CANARDS BURGAUD',
        tradeName: 'GERARD BURGAUD - LES CANARDS BURGAUD',
        address: "PARC D'ACTIVITES DE LA BLOIRE 42 RUE GUSTAVE EIFFEL",
        postalCode: '85300',
        city: 'CHALLANS',
        nafCode: '85.047.003',
        geolocation: {
          y: -1.849943,
          x: 46.832063
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '40180086700012',
        name: 'EARL JOLLY',
        tradeName: 'EARL JOLLY',
        address: 'LE SEJOUR',
        postalCode: '85170',
        city: 'DOMPIERRE SUR YON',
        nafCode: '85.081.001',
        geolocation: {
          y: -1.431468,
          x: 46.739556
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '60165014600108',
        name: 'EURALIS GASTRONOMIE',
        tradeName: 'EURALIS GASTRONOMIE',
        address: 'ZI DU BOIS JOLY',
        postalCode: '85500',
        city: 'LES HERBIERS',
        nafCode: '85.109.001',
        geolocation: {
          y: -1.040134,
          x: 46.858145
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '31667398700012',
        name: 'CAILLES ROBIN',
        tradeName: 'CAILLES ROBIN',
        address: '16 BD DES CAPUCINES',
        postalCode: '85190',
        city: 'MACHE',
        nafCode: '85.130.002',
        geolocation: {
          y: -1.691395,
          x: 46.756547
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '37840398400016',
        name: 'ERNEST SOULARD',
        tradeName: 'ERNEST SOULARD',
        address: 'LES LANDES L OIE LES LANDES',
        postalCode: '85140',
        city: 'ESSARTS EN BOCAGE',
        nafCode: '85.165.001',
        geolocation: {
          y: -1.125905,
          x: 46.799771
        },
        kind: 'Slaughterhouse'
      },
      {
        siret: '47973740500015',
        name: 'ABATTOIR ALLARD',
        tradeName: 'ABATTOIR ALLARD',
        address: 'ZONE INDUSTRIELLE LES LAND',
        postalCode: '85140',
        city: 'ESSARTS EN BOCAGE',
        nafCode: '85.165.002',
        geolocation: {
          y: -1.127975,
          x: 46.801677
        },
        kind: 'Slaughterhouse'
      }
    ].map((company) => ({
      ...company,
      kind: company.kind as CompanyKind,
      geolocation: company.geolocation
        ? db.raw('Point(?, ?)', [company.geolocation.x, company.geolocation.y])
        : null
    }))
  );
};
