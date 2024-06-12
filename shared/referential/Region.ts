import { z } from 'zod';
import { Department } from './Department';

export const Region = z.enum(
  [
    '84',
    '27',
    '53',
    '24',
    '94',
    '44',
    '32',
    '11',
    '28',
    '75',
    '76',
    '52',
    '93',
    '01',
    '02',
    '03',
    '04',
    '06',
  ],
  {
    errorMap: () => ({ message: 'Veuillez renseigner la région' }),
  }
);

export type Region = z.infer<typeof Region>;

export const RegionList: Region[] = Region.options;

export const Regions: Record<
  Region,
  {
    name: string;
    shortName: string;
    center: {
      latitude: number;
      longitude: number;
    };
    departments: Department[];
    establishment?: {
      name?: string;
      street: string;
      postalCode: string;
      city: string;
      additionalLine?: string;
    };
  }
> = {
  '84': {
    name: 'Auvergne-Rhône-Alpes',
    shortName: 'ARA',
    center: {
      latitude: 45.4,
      longitude: 4.7,
    },
    departments: [
      '01',
      '03',
      '07',
      '15',
      '26',
      '38',
      '42',
      '43',
      '63',
      '69',
      '73',
      '74',
    ],
    establishment: {
      street: '165 rue Garibaldi',
      postalCode: '69003',
      city: 'Lyon',
    },
  },
  '27': {
    name: 'Bourgogne-Franche-Comté',
    shortName: 'BFC',
    center: {
      latitude: 47.09,
      longitude: 4.81,
    },
    departments: ['21', '25', '39', '58', '70', '71', '89', '90'],
    establishment: {
      street: '4 bis rue Hoche',
      postalCode: '21000',
      city: 'Dijon',
      additionalLine: 'Cité Administrative',
    },
  },
  '53': {
    name: 'Bretagne',
    shortName: 'BRE',
    center: {
      latitude: 48.12,
      longitude: -2.92,
    },
    departments: ['22', '29', '35', '56'],
    establishment: {
      street: '12 rue du Botrel',
      postalCode: '35042',
      city: 'Rennes Cedex',
    },
  },
  '24': {
    name: 'Centre-Val de Loire',
    shortName: 'CVL',
    center: {
      latitude: 47.5,
      longitude: 1.75,
    },
    departments: ['18', '28', '36', '37', '41', '45'],
    establishment: {
      street: '131 rue du Faubourg Bannier',
      postalCode: '45042',
      city: 'Orléans Cedex 1',
    },
  },
  '94': {
    name: 'Corse',
    shortName: 'COR',
    center: {
      latitude: 42.15,
      longitude: 9.1,
    },
    departments: ['2A', '2B'],
    establishment: {
      street: 'Avenue Jean Nicoli',
      postalCode: '20200',
      city: 'Bastia',
    },
  },
  '44': {
    name: 'Grand Est',
    shortName: 'GES',
    center: {
      latitude: 48.7,
      longitude: 5.6,
    },
    departments: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
    establishment: {
      name: 'SRAL Grand Est',
      street: '14 rue du Maréchal Juin',
      postalCode: '67084',
      city: 'Strasbourg Cedex',
    },
  },
  '32': {
    name: 'Hauts-de-France',
    shortName: 'HDF',
    center: {
      latitude: 50,
      longitude: 2.88,
    },
    departments: ['02', '59', '60', '62', '80'],
    establishment: {
      street: '175 rue Sadi Carnot',
      postalCode: '59034',
      city: 'Lille Cedex',
    },
  },
  '11': {
    name: 'Île-de-France',
    shortName: 'IDF',
    center: {
      latitude: 48.7,
      longitude: 2.5,
    },
    departments: ['75', '77', '78', '91', '92', '93', '94'],
    establishment: {
      street: '18 avenue du Maine',
      postalCode: '75015',
      city: 'Paris',
    },
  },
  '28': {
    name: 'Normandie',
    shortName: 'NOR',
    center: {
      latitude: 49.1,
      longitude: 0,
    },
    departments: ['14', '27', '50', '61', '76'],
    establishment: {
      street: '21 avenue de la République',
      postalCode: '76036',
      city: 'Rouen Cedex',
    },
  },
  '75': {
    name: 'Nouvelle-Aquitaine',
    shortName: 'NAQ',
    center: {
      latitude: 45.5,
      longitude: 0.5,
    },
    departments: [
      '16',
      '17',
      '19',
      '23',
      '24',
      '33',
      '40',
      '47',
      '64',
      '79',
      '86',
      '87',
    ],
    establishment: {
      street: 'Cité Administrative',
      postalCode: '33077',
      city: 'Bordeaux Cedex',
    },
  },
  '76': {
    name: 'Occitanie',
    shortName: 'OCC',
    center: {
      latitude: 43.7,
      longitude: 2.1,
    },
    departments: [
      '09',
      '11',
      '12',
      '30',
      '31',
      '32',
      '34',
      '46',
      '48',
      '65',
      '66',
      '81',
      '82',
    ],
    establishment: {
      street: '3 Boulevard Montmorency',
      postalCode: '31074',
      city: 'Toulouse Cedex 7',
    },
  },
  '52': {
    name: 'Pays de la Loire',
    shortName: 'PDL',
    center: {
      latitude: 47.6,
      longitude: -0.6,
    },
    departments: ['44', '49', '53', '72', '85'],
    establishment: {
      name: 'SRAL Pays de la Loire',
      street: '15 Boulevard Léon Bureau',
      postalCode: '44262',
      city: 'Nantes Cedex 2',
    },
  },
  '93': {
    name: "Provence-Alpes-Côte d'Azur",
    shortName: 'PAC',
    center: {
      latitude: 43.8,
      longitude: 6.1,
    },
    departments: ['04', '05', '06', '13', '83', '84'],
    establishment: {
      street: '22 rue Borde',
      postalCode: '13285',
      city: 'Marseille Cedex 08',
    },
  },
  '01': {
    name: 'Guadeloupe',
    shortName: 'GUA',
    center: {
      latitude: 45.6,
      longitude: -2.8,
    },
    departments: ['971'],
  },
  '02': {
    name: 'Martinique',
    shortName: 'MAR',
    center: {
      latitude: 45.6,
      longitude: -5.8,
    },
    departments: ['972'],
  },
  '03': {
    name: 'Guyane',
    shortName: 'GUY',
    center: {
      latitude: 47.1,
      longitude: -5.8,
    },
    departments: ['973'],
  },
  '04': {
    name: 'La Réunion',
    shortName: 'REU',
    center: {
      latitude: 44.25,
      longitude: -2.45,
    },
    departments: ['974'],
  },
  '06': {
    name: 'Mayotte',
    shortName: 'MYT',
    center: {
      latitude: 44.3,
      longitude: -3.9,
    },
    departments: ['976'],
  },
};
