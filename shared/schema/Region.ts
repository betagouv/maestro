import { z } from 'zod';

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

export const RegionList: Region[] = [
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
];

// 84       |   45.75      |    4.85     |  Auvergne-Rhône-Alpes
// |    27       |   47.09      |    4.81     |  Bourgogne-Franche-Comté
// |    53       |   48.12      |   -2.92     |  Bretagne
// |    24       |   47.55      |    1.33     |  Centre-Val de Loire
// |    94       |   42.25      |    9.00     |  Corse
// |    44       |   48.98      |    5.37     |  Grand Est
// |    32       |   50.50      |    2.88     |  Hauts-de-France
// |    11       |   48.85      |    2.35     |  Île-de-France
// |    28       |   49.10      |    0.40     |  Normandie
// |    75       |   45.50      |    0.50     |  Nouvelle-Aquitaine
// |    76       |   43.60      |    1.44     |  Occitanie
// |    52       |   47.60      |   -0.83     |  Pays de la Loire
// |    93       |   43.88      |    5.39     |  Provence-Alpes-Côte d'Azur

export const Regions: Record<
  Region,
  {
    name: string;
    shortName: string;
    center: {
      latitude: number;
      longitude: number;
    };
  }
> = {
  '84': {
    name: 'Auvergne-Rhône-Alpes',
    shortName: 'ARA',
    center: {
      latitude: 45.75,
      longitude: 4.85,
    },
  },
  '27': {
    name: 'Bourgogne-Franche-Comté',
    shortName: 'BFC',
    center: {
      latitude: 47.09,
      longitude: 4.81,
    },
  },
  '53': {
    name: 'Bretagne',
    shortName: 'BRE',
    center: {
      latitude: 48.12,
      longitude: -2.92,
    },
  },
  '24': {
    name: 'Centre-Val de Loire',
    shortName: 'CVL',
    center: {
      latitude: 47.55,
      longitude: 1.33,
    },
  },
  '94': {
    name: 'Corse',
    shortName: 'COR',
    center: {
      latitude: 42.25,
      longitude: 9,
    },
  },
  '44': {
    name: 'Grand Est',
    shortName: 'GES',
    center: {
      latitude: 48.98,
      longitude: 5.37,
    },
  },
  '32': {
    name: 'Hauts-de-France',
    shortName: 'HDF',
    center: {
      latitude: 50.5,
      longitude: 2.88,
    },
  },
  '11': {
    name: 'Île-de-France',
    shortName: 'IDF',
    center: {
      latitude: 48.85,
      longitude: 2.35,
    },
  },
  '28': {
    name: 'Normandie',
    shortName: 'NOR',
    center: {
      latitude: 49.1,
      longitude: 0.4,
    },
  },
  '75': {
    name: 'Nouvelle-Aquitaine',
    shortName: 'NAQ',
    center: {
      latitude: 45.5,
      longitude: 0.5,
    },
  },
  '76': {
    name: 'Occitanie',
    shortName: 'OCC',
    center: {
      latitude: 43.6,
      longitude: 1.44,
    },
  },
  '52': {
    name: 'Pays de la Loire',
    shortName: 'PDL',
    center: {
      latitude: 47.6,
      longitude: -0.83,
    },
  },
  '93': {
    name: "Provence-Alpes-Côte d'Azur",
    shortName: 'PAC',
    center: {
      latitude: 43.88,
      longitude: 5.39,
    },
  },
  '01': {
    name: 'Guadeloupe',
    shortName: 'GUA',
    center: {
      latitude: 16.25,
      longitude: -61.5,
    },
  },
  '02': {
    name: 'Martinique',
    shortName: 'MAR',
    center: {
      latitude: 14.6,
      longitude: -61,
    },
  },
  '03': {
    name: 'Guyane',
    shortName: 'GUY',
    center: {
      latitude: 4,
      longitude: -53,
    },
  },
  '04': {
    name: 'La Réunion',
    shortName: 'REU',
    center: {
      latitude: -21.1,
      longitude: 55.6,
    },
  },
  '06': {
    name: 'Mayotte',
    shortName: 'MYT',
    center: {
      latitude: -12.8,
      longitude: 45.2,
    },
  },
};
