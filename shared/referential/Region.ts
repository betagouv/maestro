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
      additionalAddress?: string;
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
  },
  '27': {
    name: 'Bourgogne-Franche-Comté',
    shortName: 'BFC',
    center: {
      latitude: 47.09,
      longitude: 4.81,
    },
    departments: ['21', '25', '39', '58', '70', '71', '89', '90'],
  },
  '53': {
    name: 'Bretagne',
    shortName: 'BRE',
    center: {
      latitude: 48.12,
      longitude: -2.92,
    },
    departments: ['22', '29', '35', '56'],
  },
  '24': {
    name: 'Centre-Val de Loire',
    shortName: 'CVL',
    center: {
      latitude: 47.5,
      longitude: 1.75,
    },
    departments: ['18', '28', '36', '37', '41', '45'],
  },
  '94': {
    name: 'Corse',
    shortName: 'COR',
    center: {
      latitude: 42.15,
      longitude: 9.1,
    },
    departments: ['2A', '2B'],
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
      name: 'DRAAF Grand Est',
      street: '4 Rue Dom Pierre Perignon',
      postalCode: '51000',
      city: 'Châlons-en-Champagne',
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
      name: 'DRAAF Hauts de France',
      street: '518 rue St Fuscien',
      postalCode: '80094',
      additionalAddress: 'CS 90069',
      city: 'Amiens Cedex 3',
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
  },
  '28': {
    name: 'Normandie',
    shortName: 'NOR',
    center: {
      latitude: 49.1,
      longitude: 0,
    },
    departments: ['14', '27', '50', '61', '76'],
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
      name: 'DRAAF Pays de Loire',
      street: '5 rue Françoise Giroud',
      additionalAddress: 'CS 67517',
      postalCode: '44275',
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
