import { z } from 'zod/v4';
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
    '06'
  ],
  {
    error: () => 'Veuillez renseigner la région'
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
    borderingDepartments: Department[];
    establishment: {
      name: string;
      service?: string;
      locality?: string;
      street: string;
      postalCode: string;
      city: string;
      additionalAddress?: string;
    };
    isDrom?: boolean;
  }
> = {
  '84': {
    name: 'Auvergne-Rhône-Alpes',
    shortName: 'ARA',
    center: {
      latitude: 45.4,
      longitude: 4.7
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
      '74'
    ],
    borderingDepartments: [
      '39',
      '71',
      '58',
      '18',
      '23',
      '19',
      '46',
      '12',
      '48',
      '30',
      '84',
      '04',
      '05'
    ],
    establishment: {
      name: 'DRAAF / SRAL Auvergne-Rhône-Alpes',
      locality: 'Marmilhat',
      street: '16B Rue Aimé Rudel',
      postalCode: '63370',
      city: 'Lempdes',
      additionalAddress: 'BP 45'
    }
  },
  '27': {
    name: 'Bourgogne-Franche-Comté',
    shortName: 'BFC',
    center: {
      latitude: 47.09,
      longitude: 4.81
    },
    departments: ['21', '25', '39', '58', '70', '71', '89', '90'],
    borderingDepartments: [
      '68',
      '88',
      '52',
      '10',
      '77',
      '45',
      '18',
      '03',
      '42',
      '69',
      '01'
    ],
    establishment: {
      name: 'DRAAF / SRAL Bourgogne-Franche-Comté',
      street: '4 bis rue Hoche',
      postalCode: '21078',
      city: 'Dijon',
      additionalAddress: 'BP 87865'
    }
  },
  '53': {
    name: 'Bretagne',
    shortName: 'BRE',
    center: {
      latitude: 48.12,
      longitude: -2.92
    },
    departments: ['22', '29', '35', '56'],
    borderingDepartments: ['50', '53', '49', '44'],
    establishment: {
      name: 'DRAAF / SRAL Bretagne',
      street: '15 avenue de Cucillé',
      postalCode: '35047',
      city: 'Rennes Cedex 9'
    }
  },
  '24': {
    name: 'Centre-Val de Loire',
    shortName: 'CVL',
    center: {
      latitude: 47.5,
      longitude: 1.75
    },
    departments: ['18', '28', '36', '37', '41', '45'],
    borderingDepartments: [
      '77',
      '89',
      '58',
      '03',
      '23',
      '87',
      '86',
      '49',
      '72',
      '61',
      '27',
      '91',
      '78'
    ],
    establishment: {
      name: 'DRAAF / SRAL Centre-Val de Loire',
      service: 'Cité Administrative Coligny - Bâtiment D',
      street: '131 Rue du Faubourg Bannier',
      postalCode: '45000',
      city: 'Orléans'
    }
  },
  '94': {
    name: 'Corse',
    shortName: 'COR',
    center: {
      latitude: 42.15,
      longitude: 9.1
    },
    departments: ['2A', '2B'],
    borderingDepartments: [],
    establishment: {
      name: 'DRAAF / SRAL Corse',
      service: 'Service régional de l’alimentation (SRAL)',
      street: 'Le Solférino - 8 cours Napoléon',
      postalCode: '20704',
      city: 'Ajaccio Cedex 9'
    }
  },
  '44': {
    name: 'Grand Est',
    shortName: 'GES',
    center: {
      latitude: 48.7,
      longitude: 5.6
    },
    departments: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88'],
    borderingDepartments: ['59', '02', '77', '89', '21', '70', '80'],
    establishment: {
      name: 'DRAAF / SRAL Grand Est',
      locality: 'Parc technologique du Mont-Bernard',
      street: '4 Rue Dom Pierre Perignon',
      postalCode: '51000',
      city: 'Châlons-en-Champagne'
    }
  },
  '32': {
    name: 'Hauts-de-France',
    shortName: 'HDF',
    center: {
      latitude: 50,
      longitude: 2.88
    },
    departments: ['02', '59', '60', '62', '80'],
    borderingDepartments: ['08', '51', '77', '95', '27', '76'],
    establishment: {
      name: 'DRAAF / SRAL Hauts de France',
      service: 'Cité Administrative - Bâtiment A',
      street: '53, rue de la vallée',
      postalCode: '80000',
      city: 'Amiens'
    }
  },
  '11': {
    name: 'Île-de-France',
    shortName: 'IDF',
    center: {
      latitude: 48.7,
      longitude: 2.5
    },
    departments: ['75', '77', '78', '91', '92', '93', '94', '95'],
    borderingDepartments: ['60', '02', '51', '10', '89', '45', '28', '27'],
    establishment: {
      name: 'DRIAAF / SRAL Île de France',
      service: 'Préfecture de Paris et d’Île-de-France',
      street: '5 rue Leblanc',
      postalCode: '75911',
      city: 'Paris Cedex 15'
    }
  },
  '28': {
    name: 'Normandie',
    shortName: 'NOR',
    center: {
      latitude: 49.1,
      longitude: 0
    },
    departments: ['14', '27', '50', '61', '76'],
    borderingDepartments: [
      '80',
      '60',
      '95',
      '78',
      '28',
      '41',
      '72',
      '53',
      '35'
    ],
    establishment: {
      name: 'DRAAF / SRAL Normandie',
      street: '6 boulevard du général Vanier',
      postalCode: '14070',
      city: 'Caen Cedex 5',
      additionalAddress: 'CS 95181'
    }
  },
  '75': {
    name: 'Nouvelle-Aquitaine',
    shortName: 'NAQ',
    center: {
      latitude: 45.5,
      longitude: 0.5
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
      '87'
    ],
    borderingDepartments: [
      '85',
      '49',
      '37',
      '36',
      '18',
      '03',
      '63',
      '15',
      '46',
      '82',
      '32',
      '65'
    ],
    establishment: {
      name: 'DRAAF / SRAL Nouvelle-Aquitaine',
      service: 'Cité Administrative de Bordeaux',
      street: '2 rue Jules Ferry',
      postalCode: '33000',
      city: 'Bordeaux'
    }
  },
  '76': {
    name: 'Occitanie',
    shortName: 'OCC',
    center: {
      latitude: 43.7,
      longitude: 2.1
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
      '82'
    ],
    borderingDepartments: [
      '64',
      '40',
      '47',
      '24',
      '19',
      '15',
      '43',
      '07',
      '26',
      '84',
      '13'
    ],
    establishment: {
      name: 'DRAAF / SRAL Occitanie',
      street: 'Rue de la Cité Administrative',
      postalCode: '31000',
      city: 'Toulouse'
    }
  },
  '52': {
    name: 'Pays de la Loire',
    shortName: 'PDL',
    center: {
      latitude: 47.6,
      longitude: -0.6
    },
    departments: ['44', '49', '53', '72', '85'],
    borderingDepartments: [
      '56',
      '35',
      '50',
      '61',
      '28',
      '41',
      '37',
      '86',
      '79',
      '17'
    ],
    establishment: {
      name: 'DRAAF / SRAL Pays de la Loire',
      street: '5 rue Françoise Giroud',
      additionalAddress: 'CS 67516',
      postalCode: '44275',
      city: 'Nantes Cedex 2'
    }
  },
  '93': {
    name: "Provence-Alpes-Côte d'Azur",
    shortName: 'PAC',
    center: {
      latitude: 43.8,
      longitude: 6.1
    },
    departments: ['04', '05', '06', '13', '83', '84'],
    borderingDepartments: ['73', '38', '26', '07', '30'],
    establishment: {
      name: 'DRAAF / SRAL Provence Alpes Cote d’azur',
      street: '132 Bd de Paris',
      postalCode: '13000',
      city: 'Marseille'
    }
  },
  '01': {
    name: 'Guadeloupe',
    shortName: 'GUA',
    center: {
      latitude: 45.6,
      longitude: -2.8
    },
    departments: ['971'],
    borderingDepartments: [],
    isDrom: true,
    establishment: {
      name: 'DAAF / SALIM Guadeloupe',
      street: 'Rue Edmond Maurice Carlton - Saint Phy',
      postalCode: '97108',
      city: 'Basse Terre cedex'
    }
  },
  '02': {
    name: 'Martinique',
    shortName: 'MAR',
    center: {
      latitude: 45.6,
      longitude: -5.8
    },
    departments: ['972'],
    borderingDepartments: [],
    isDrom: true,
    establishment: {
      name: 'DAAF / SALIM Martinique',
      street: 'Rue des Pionniers',
      postalCode: '97262',
      city: 'Fort-de-France cedex',
      additionalAddress: 'BP 642'
    }
  },
  '03': {
    name: 'Guyane',
    shortName: 'GUY',
    center: {
      latitude: 47.1,
      longitude: -5.8
    },
    departments: ['973'],
    borderingDepartments: [],
    isDrom: true,
    establishment: {
      name: 'DAAF / SALIM de Guyane',
      street: 'Parc Rebard',
      postalCode: '97305',
      city: 'Cayenne cedex',
      additionalAddress: 'BP 5002'
    }
  },
  '04': {
    name: 'La Réunion',
    shortName: 'REU',
    center: {
      latitude: 44.25,
      longitude: -2.45
    },
    departments: ['974'],
    borderingDepartments: [],
    isDrom: true,
    establishment: {
      name: 'DAAF / SALIM de la Réunion',
      street: '29 Boulevard de la Providence',
      postalCode: '97489',
      city: 'Saint Denis cedex'
    }
  },
  '06': {
    name: 'Mayotte',
    shortName: 'MYT',
    center: {
      latitude: 44.3,
      longitude: -3.9
    },
    departments: ['976'],
    borderingDepartments: [],
    isDrom: true,
    establishment: {
      name: 'DAAF / SALIM Mayotte',
      street: '15 rue Mariaze',
      postalCode: '97600',
      city: 'Mamoudzou'
    }
  }
};

export const RegionSort = (a: Region, b: Region) => {
  return RegionList.indexOf(a) - RegionList.indexOf(b);
};

export const isDromRegion = (region?: Region | null) =>
  region && Regions[region].isDrom;
