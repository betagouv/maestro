import { isNil } from 'lodash-es';
import { z } from 'zod';
import type { Establishment } from './Region';

export const Department = z.enum(
  [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '2A',
    '2B',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59',
    '60',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '70',
    '71',
    '72',
    '73',
    '74',
    '75',
    '76',
    '77',
    '78',
    '79',
    '80',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88',
    '89',
    '90',
    '91',
    '92',
    '93',
    '94',
    '95',
    '971',
    '972',
    '973',
    '974',
    '976'
  ],

  {
    error: () => 'Veuillez renseigner le département.'
  }
);

export type Department = z.infer<typeof Department>;

export const DepartmentList: Department[] = Department.options;

export const DepartmentLabels: Record<Department, string> = {
  '01': 'Ain',
  '02': 'Aisne',
  '03': 'Allier',
  '04': 'Alpes-de-Haute-Provence',
  '05': 'Hautes-Alpes',
  '06': 'Alpes-Maritimes',
  '07': 'Ardèche',
  '08': 'Ardennes',
  '09': 'Ariège',
  '10': 'Aube',
  '11': 'Aude',
  '12': 'Aveyron',
  '13': 'Bouches-du-Rhône',
  '14': 'Calvados',
  '15': 'Cantal',
  '16': 'Charente',
  '17': 'Charente-Maritime',
  '18': 'Cher',
  '19': 'Corrèze',
  '21': "Côte-d'Or",
  '22': "Côtes-d'Armor",
  '23': 'Creuse',
  '24': 'Dordogne',
  '25': 'Doubs',
  '26': 'Drôme',
  '27': 'Eure',
  '28': 'Eure-et-Loir',
  '29': 'Finistère',
  '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse',
  '30': 'Gard',
  '31': 'Haute-Garonne',
  '32': 'Gers',
  '33': 'Gironde',
  '34': 'Hérault',
  '35': 'Ille-et-Vilaine',
  '36': 'Indre',
  '37': 'Indre-et-Loire',
  '38': 'Isère',
  '39': 'Jura',
  '40': 'Landes',
  '41': 'Loir-et-Cher',
  '42': 'Loire',
  '43': 'Haute-Loire',
  '44': 'Loire-Atlantique',
  '45': 'Loiret',
  '46': 'Lot',
  '47': 'Lot-et-Garonne',
  '48': 'Lozère',
  '49': 'Maine-et-Loire',
  '50': 'Manche',
  '51': 'Marne',
  '52': 'Haute-Marne',
  '53': 'Mayenne',
  '54': 'Meurthe-et-Moselle',
  '55': 'Meuse',
  '56': 'Morbihan',
  '57': 'Moselle',
  '58': 'Nièvre',
  '59': 'Nord',
  '60': 'Oise',
  '61': 'Orne',
  '62': 'Pas-de-Calais',
  '63': 'Puy-de-Dôme',
  '64': 'Pyrénées-Atlantiques',
  '65': 'Hautes-Pyrénées',
  '66': 'Pyrénées-Orientales',
  '67': 'Bas-Rhin',
  '68': 'Haut-Rhin',
  '69': 'Rhône',
  '70': 'Haute-Saône',
  '71': 'Saône-et-Loire',
  '72': 'Sarthe',
  '73': 'Savoie',
  '74': 'Haute-Savoie',
  '75': 'Paris',
  '76': 'Seine-Maritime',
  '77': 'Seine-et-Marne',
  '78': 'Yvelines',
  '79': 'Deux-Sèvres',
  '80': 'Somme',
  '81': 'Tarn',
  '82': 'Tarn-et-Garonne',
  '83': 'Var',
  '84': 'Vaucluse',
  '85': 'Vendée',
  '86': 'Vienne',
  '87': 'Haute-Vienne',
  '88': 'Vosges',
  '89': 'Yonne',
  '90': 'Territoire de Belfort',
  '91': 'Essonne',
  '92': 'Hauts-de-Seine',
  '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne',
  '95': "Val-d'Oise",
  '971': 'Guadeloupe',
  '972': 'Martinique',
  '973': 'Guyane',
  '974': 'La Réunion',
  '976': 'Mayotte'
};

export const DepartmentSort = (a?: Department | null, b?: Department | null) =>
  isNil(a) ? (isNil(b) ? 0 : -1) : isNil(b) ? 1 : a.localeCompare(b);

export const DepartmentEstablishments: Partial<
  Record<Department, Establishment>
> = {
  '01': {
    name: "DDPP de l'Ain",
    street: '9 rue de la Grenouillère',
    additionalAddress: 'CS 10411',
    postalCode: '01000',
    city: 'BOURG EN BRESSE'
  },
  '02': {
    name: "DDPP de l'Aisne",
    street: 'cs 90603',
    postalCode: '02003',
    city: 'LAON CEDEX'
  },
  '03': {
    name: "DDETSPP de l'Allier",
    street: '20 rue Aristide Briand',
    postalCode: '03400',
    city: 'YZEURE'
  },
  '04': {
    name: 'DDETSPP des Alpes-de-Haute-Provence',
    locality: 'rue Pasteur',
    street: 'CENTRE ADMINISTRATIF ROMIEU',
    additionalAddress: 'BP 9028',
    postalCode: '04990',
    city: 'DIGNE LES BAINS CEDEX 9'
  },
  '05': {
    name: 'DDETSPP des Hautes-Alpes',
    locality: 'parc Agroforest',
    street: '5 RUE DES SILOS - BP 16002',
    postalCode: '05010',
    city: 'GAP CEDEX'
  },
  '06': {
    name: 'DDPP des Alpes-Maritimes',
    locality: '147 boulevard du Mercantour',
    street: 'DDPP',
    postalCode: '06286',
    city: 'NICE CEDEX 3'
  },
  '07': {
    name: "DDETSPP de l'Ardèche",
    street: '7, bd du Lycée',
    additionalAddress: 'BP 730',
    postalCode: '07007',
    city: 'PRIVAS CEDEX'
  },
  '08': {
    name: 'DDETSPP des Ardennes',
    locality: '18 rue Francois Mitterrand',
    street: 'BP 60029',
    postalCode: '08005',
    city: 'CHARLEVILLE MEZIERES CEDEX'
  },
  '09': {
    name: "DDETSPP de l'Ariège",
    street: '9 RUE LIEUTENANT PAUL DELPECH',
    postalCode: '09000',
    city: 'FOIX'
  },
  '10': {
    name: "DDETSPP de l'Aube",
    street: '2 Rue Fernand Giroux',
    additionalAddress: '30376',
    postalCode: '10000',
    city: 'TROYES'
  },
  '11': {
    name: "DDETSPP de l'Aude",
    street: '1 pl Gaston Jourdanne',
    postalCode: '11000',
    city: 'CARCASSONNE'
  },
  '12': {
    name: "DDETSPP de l'Aveyron",
    street: '9, Rue de Bruxelles',
    additionalAddress: 'BP 3125',
    postalCode: '12031',
    city: 'RODEZ CEDEX 9'
  },
  '13': {
    name: 'DDPP des Bouches-du-Rhône',
    street: '22 rue Borde',
    additionalAddress: 'MARSEILLE 8',
    postalCode: '13008',
    city: 'MARSEILLE'
  },
  '14': {
    name: 'DDPP du Calvados',
    street: '6, Boulevard du Général Vanier',
    additionalAddress: 'CS 95181',
    postalCode: '14070',
    city: 'CAEN CEDEX 5'
  },
  '15': {
    name: 'DDETSPP du Cantal',
    locality: 'cs 50739',
    street: "1 RUE DE L'OLMET - PORTE B",
    postalCode: '15007',
    city: 'AURILLAC CEDEX'
  },
  '16': {
    name: 'DDETSPP de la Charente',
    locality: 'cite administrative',
    street: 'RUE RAYMOND POINCARE',
    postalCode: '16000',
    city: 'ANGOULEME'
  },
  '17': {
    name: 'DDPP de la Charente-Maritime',
    locality: 'cite Duperre',
    street: '5 PLACE DES CORDELIERS',
    postalCode: '17000',
    city: 'LA ROCHELLE'
  },
  '18': {
    name: 'DDETSPP du Cher',
    locality: '6, place de la Pyrotechnie',
    street: 'CS 60 022',
    postalCode: '18020',
    city: 'BOURGES CEDEX'
  },
  '19': {
    name: 'DDETSPP de la Corrèze',
    locality: 'cité administrative J. Montalat',
    street: 'Place Martial Brigouleix - BP314',
    postalCode: '19011',
    city: 'TULLE'
  },
  '21': {
    name: "DDPP de la Côte-d'Or",
    locality: '57 rue de Mulhouse',
    street: 'B.P. 1517',
    additionalAddress: 'BP 53533',
    postalCode: '21033',
    city: 'DIJON CEDEX'
  },
  '22': {
    name: "DDPP des Côtes-d'Armor",
    street: '9, rue du Sabot',
    additionalAddress: 'BP 34',
    postalCode: '22440',
    city: 'PLOUFRAGAN'
  },
  '23': {
    name: 'DDETSPP de la Creuse',
    street: '1 pl Varillas',
    postalCode: '23000',
    city: 'GUERET'
  },
  '24': {
    name: 'DDETSPP de la Dordogne',
    locality: "services de l'Etat en Dordogne",
    street: 'Cité Administrative',
    postalCode: '24024',
    city: 'PERIGUEUX CEDEX'
  },
  '25': {
    name: 'DDETSPP du Doubs',
    street: '11 b rue Nicolas Bruand',
    postalCode: '25000',
    city: 'BESANCON'
  },
  '26': {
    name: 'DDPP de la Drôme',
    street: '33 av de Romans',
    additionalAddress: 'BP 96',
    postalCode: '26000',
    city: 'VALENCE'
  },
  '27': {
    name: "DDPP de l'Eure",
    street: '27 rue Joséphine',
    postalCode: '27000',
    city: 'EVREUX'
  },
  '28': {
    name: "DDETSPP d'Eure-et-Loir",
    locality: '15, place de la République',
    street: 'CS 70527',
    postalCode: '28019',
    city: 'CHARTRES CEDEX'
  },
  '29': {
    name: 'DDPP du Finistère',
    street: '2 rue de Kerivoal',
    additionalAddress: 'DDPP 29',
    postalCode: '29000',
    city: 'QUIMPER'
  },
  '2A': {
    name: 'DDETSPP de la Corse du Sud',
    street: "18 AV COLONEL COLONNA D'ORNANO",
    postalCode: '20000',
    city: 'AJACCIO'
  },
  '2B': {
    name: 'DDETSPP de la Haute-Corse',
    locality: 'immeuble Bella Vista',
    street: 'Rue Paratojo',
    additionalAddress: 'CS 60011',
    postalCode: '20288',
    city: 'BASTIA CEDEX'
  },
  '30': {
    name: 'DDPP du Gard',
    street: '1120 rte de Saint Gilles',
    additionalAddress: 'BP 10029',
    postalCode: '30000',
    city: 'NIMES'
  },
  '31': {
    name: 'DDPP de la Haute-Garonne',
    locality: 'cité administrative bâtiment C',
    street: '2ème étage 1 PLACE EMILE BLOUIN',
    postalCode: '31952',
    city: 'TOULOUSE CEDEX 9'
  },
  '32': {
    name: 'DDETSPP du Gers',
    street: '8 Chemin de la Caillaouère',
    postalCode: '32020',
    city: 'AUCH CEDEX 09'
  },
  '33': {
    name: 'DDPP de la Gironde',
    street: '5 bd Jacques Chaban Delmas',
    additionalAddress: 'CS 60074 BRUGES',
    postalCode: '33520',
    city: 'BRUGES'
  },
  '34': {
    name: "DDPP de l'Hérault",
    street: '109 avenue du Père SOULAS',
    additionalAddress: 'CS 87377',
    postalCode: '34184',
    city: 'MONTPELLIER CEDEX 4'
  },
  '35': {
    name: "DDPP d'Ille-et-Vilaine",
    street: '15, avenue de Cucillé',
    postalCode: '35919',
    city: 'RENNES CEDEX 9'
  },
  '36': {
    name: "DDETSPP de l'Indre",
    locality: 'cité administrative',
    street: 'Bvd George Sand',
    additionalAddress: 'BP 613',
    postalCode: '36020',
    city: 'CHATEAUROUX CEDEX'
  },
  '37': {
    name: "DDPP d'Indre-et-Loire",
    street: '61 AVENUE DE GRAMMONT',
    additionalAddress: 'BP 12023',
    postalCode: '37020',
    city: 'TOURS CEDEX 1'
  },
  '38': {
    name: "DDPP de l'Isère",
    street: 'CS 6',
    postalCode: '38028',
    city: 'GRENOBLE CEDEX 1'
  },
  '39': {
    name: 'DDETSPP du Jura',
    street: '8 rue de la Préfecture',
    additionalAddress: 'BP 10634',
    postalCode: '39021',
    city: 'LONS LE SAUNIER CEDEX'
  },
  '40': {
    name: 'DDETSPP des Landes',
    street: '1 PLACE SAINT LOUIS',
    additionalAddress: 'BP 371',
    postalCode: '40012',
    city: 'MONT DE MARSAN CEDEX'
  },
  '41': {
    name: 'DDETSPP de Loir-et-Cher',
    locality: 'Pôle administratif',
    street: '31 Mail Pierre Charlot',
    additionalAddress: '10103',
    postalCode: '41000',
    city: 'BLOIS'
  },
  '42': {
    name: 'DDPP de la Loire',
    locality: 'Immeuble Le Continental',
    street: '10 rue claudius Buard - CS 40272',
    postalCode: '42014',
    city: 'SAINT-ETIENNE CEDEX 02'
  },
  '43': {
    name: 'DDETSPP de la Haute-Loire',
    street: '3 CHE DU FIEU',
    additionalAddress: 'BP 348',
    postalCode: '43000',
    city: 'LE PUY EN VELAY'
  },
  '44': {
    name: 'DDPP de la Loire-Atlantique',
    street: '10 bd Gaston Doumergue',
    additionalAddress: 'BP 76315',
    postalCode: '44200',
    city: 'NANTES'
  },
  '45': {
    name: 'DDPP du Loiret',
    street: 'PREFECTURE DU LOIRET',
    postalCode: '45042',
    city: 'ORLEANS CEDEX 1'
  },
  '46': {
    name: 'DDETSPP du Lot',
    locality: '304 rue Victor Hugo',
    street: 'DDCSPP',
    additionalAddress: 'CS 80228',
    postalCode: '46004',
    city: 'CAHORS CEDEX 9'
  },
  '47': {
    name: 'DDETSPP du Lot-et-Garonne',
    street: '935 avenue Jean Bru',
    postalCode: '47916',
    city: 'AGEN CEDEX 9'
  },
  '48': {
    name: 'DDETSPP de la Lozère',
    locality: 'Cité administrative',
    street: '9 RUE DES CARMES',
    postalCode: '48005',
    city: 'MENDE CEDEX'
  },
  '49': {
    name: 'DDPP de Maine-et-Loire',
    locality: 'Cité administrative',
    street: '15 bis, rue Dupetit-Thouars',
    postalCode: '49047',
    city: 'ANGERS CEDEX 01'
  },
  '50': {
    name: 'DDPP de la Manche',
    locality: 'BP90286',
    street: '477, boulevard de la Dollée',
    postalCode: '50006',
    city: 'ST LO CEDEX'
  },
  '51': {
    name: 'DDETSPP de la Marne',
    locality: '4 rue de Vinetz',
    street: 'CS 40266',
    postalCode: '51011',
    city: 'CHALONS EN CHAMPAGNE CEDEX'
  },
  '52': {
    name: 'DDETSPP de la Haute-Marne',
    locality: '89 rue Victoire de la Marne',
    street: 'BP 52 091',
    postalCode: '52904',
    city: 'CHAUMONT CEDEX 9'
  },
  '53': {
    name: 'DDETSPP de la Mayenne',
    locality: 'Cité administrative',
    street: '60 rue Mac Donald',
    additionalAddress: 'BP93007',
    postalCode: '53063',
    city: 'LAVAL CEDEX 9'
  },
  '54': {
    name: 'DDPP de Meurthe-et-Moselle',
    locality: 'Cité administrative - bâtiment P',
    street: '45, rue Sainte Catherine',
    additionalAddress: 'CS 84303',
    postalCode: '54043',
    city: 'NANCY CEDEX'
  },
  '55': {
    name: 'DDETSPP de la Meuse',
    street: '24 AVENUE DU 94ème RI',
    additionalAddress: 'CS 50612',
    postalCode: '55000',
    city: 'BAR LE DUC'
  },
  '56': {
    name: 'DDPP du Morbihan',
    street: '32, Boulevard de la Résistance',
    postalCode: '56000',
    city: 'VANNES'
  },
  '57': {
    name: 'DDPP de la Moselle',
    street: '4 rue des Remparts',
    additionalAddress: 'CS 40443',
    postalCode: '57008',
    city: 'METZ CEDEX 01'
  },
  '58': {
    name: 'DDETSPP de la Nièvre',
    street: '1 rue du Ravelin',
    additionalAddress: 'BP 54',
    postalCode: '58000',
    city: 'NEVERS'
  },
  '59': {
    name: 'DDPP du Nord',
    locality: 'Cité Marianne',
    street: '2 Boulevard de STRASBOURG',
    postalCode: '59000',
    city: 'LILLE'
  },
  '60': {
    name: "DDPP de l'Oise",
    street: "avenue de l'Europe",
    additionalAddress: 'BP 70634',
    postalCode: '60000',
    city: 'BEAUVAIS'
  },
  '61': {
    name: "DDETSPP de l'Orne",
    locality: 'place du General Bonet',
    street: 'CS 30358',
    postalCode: '61007',
    city: 'ALENCON CEDEX'
  },
  '62': {
    name: 'DDPP du Pas-de-Calais',
    street: 'rue Ferdinand Buisson',
    additionalAddress: 'SP 19',
    postalCode: '62000',
    city: 'ARRAS'
  },
  '63': {
    name: 'DDPP du Puy-de-Dôme',
    locality: 'Cité administrative',
    street: '2 rue Pélissier',
    additionalAddress: 'CS 40400',
    postalCode: '63033',
    city: 'CLERMONT FERRAND CEDEX 1'
  },
  '64': {
    name: 'DDPP des Pyrénées-Atlantiques',
    street: '',
    postalCode: '64071',
    city: 'PAU CEDEX'
  },
  '65': {
    name: 'DDETSPP des Hautes-Pyrénées',
    locality: 'Cité administrative Reffye',
    street: 'BP 41740',
    postalCode: '65017',
    city: 'TARBES CEDEX 9'
  },
  '66': {
    name: 'DDPP des Pyrénées-Orientales',
    street: '1, boulevard Kennedy',
    postalCode: '66100',
    city: 'PERPIGNAN'
  },
  '67': {
    name: 'DDPP du Bas-Rhin',
    locality: 'Cité administrative Gaujot',
    street: '14 rue du Maréchal Juin',
    additionalAddress: '42',
    postalCode: '67084',
    city: 'STRASBOURG CEDEX'
  },
  '68': {
    name: 'DDETSPP du Haut-Rhin',
    locality: 'cité administrative',
    street: '3, rue Fleischhauer - Bât. C',
    postalCode: '68026',
    city: 'COLMAR CEDEX'
  },
  '69': {
    name: 'DDPP du Rhône',
    street: '245 rue Garibaldi',
    additionalAddress: 'LYON 3EME',
    postalCode: '69003',
    city: 'LYON'
  },
  '70': {
    name: 'DDETSPP de la Haute-Saône',
    street: '4 rue Rene Hologne',
    postalCode: '70000',
    city: 'VESOUL'
  },
  '71': {
    name: 'DDPP de Saône-et-Loire',
    locality: 'Cité administrative',
    street: '24 Boulevard Henri Dunant',
    additionalAddress: '22017',
    postalCode: '71020',
    city: 'MACON CEDEX 9'
  },
  '72': {
    name: 'DDPP de la Sarthe',
    locality: '19, boulevard Paixhans',
    street: 'CS 91631',
    postalCode: '72016',
    city: 'LE MANS CEDEX 2'
  },
  '73': {
    name: 'DDETSPP de la Savoie',
    street: '321 chemin des Moulins',
    additionalAddress: 'BP 91113',
    postalCode: '73011',
    city: 'CHAMBERY CEDEX'
  },
  '74': {
    name: 'DDPP de la Haute-Savoie',
    street: '9 rue Blaise Pascal',
    additionalAddress: 'BP 82',
    postalCode: '74603',
    city: 'SEYNOD CEDEX'
  },
  '75': {
    name: 'DDPP de Paris',
    street: '8 RUE FROISSART',
    postalCode: '75003',
    city: 'PARIS'
  },
  '76': {
    name: 'DDPP de la Seine-Maritime',
    locality: 'Cité administrative Saint-Sever',
    street: '38 Cours Clemenceau',
    additionalAddress: 'CS41603',
    postalCode: '76107',
    city: 'ROUEN CEDEX'
  },
  '77': {
    name: 'DDPP de Seine-et-Marne',
    locality: 'Cité administrative - bat. A',
    street: '20 QUAI HIPPOLYTE ROSSIGNOL',
    postalCode: '77011',
    city: 'MELUN CEDEX'
  },
  '78': {
    name: 'DDPP des Yvelines',
    street: '30 RUE JEAN MERMOZ',
    additionalAddress: 'RP 3535',
    postalCode: '78000',
    city: 'VERSAILLES'
  },
  '79': {
    name: 'DDPP des Deux-Sèvres',
    street: "30 RUE DE L'HOTEL DE VILLE",
    additionalAddress: 'BP 30560',
    postalCode: '79000',
    city: 'NIORT'
  },
  '80': {
    name: 'DDETSPP de la Somme',
    street: '53 rue de la Vallée',
    postalCode: '80000',
    city: 'AMIENS'
  },
  '81': {
    name: 'DDETSPP du Tarn',
    locality: 'Cité administrative',
    street: '18 avenue Maréchal Joffre',
    postalCode: '81013',
    city: 'ALBI CEDEX 9'
  },
  '82': {
    name: 'DDETSPP du Tarn-et-Garonne',
    street: '140, avenue Marcel Unal',
    additionalAddress: 'BP 730',
    postalCode: '82013',
    city: 'MONTAUBAN CEDEX'
  },
  '83': {
    name: 'DDPP du Var',
    street: "boulevard du 112ème régiment d'infanterie",
    additionalAddress: 'CS 31209',
    postalCode: '83070',
    city: 'TOULON CEDEX'
  },
  '84': {
    name: 'DDPP du Vaucluse',
    street: "Services de l'Etat en Vaucluse",
    postalCode: '84905',
    city: 'AVIGNON CEDEX 9'
  },
  '85': {
    name: 'DDPP de la Vendée',
    street: '185 bd Marechal Leclerc',
    additionalAddress: 'BP 795',
    postalCode: '85000',
    city: 'LA ROCHE SUR YON'
  },
  '86': {
    name: 'DDPP de la Vienne',
    street: '20 rue de la Providence',
    additionalAddress: 'BP 10374',
    postalCode: '86000',
    city: 'POITIERS'
  },
  '87': {
    name: 'DDETSPP de la Haute-Vienne',
    street: '39 AVENUE DE LA LIBERATION',
    additionalAddress: 'CS 33918',
    postalCode: '87039',
    city: 'LIMOGES CEDEX 1'
  },
  '88': {
    name: 'DDETSPP des Vosges',
    street: '4, Avenue du Rose Poirier',
    additionalAddress: 'BP 1029',
    postalCode: '88050',
    city: 'EPINAL CEDEX 9'
  },
  '89': {
    name: "DDETSPP de l'Yonne",
    street: '3 rue Jehan Pinard',
    additionalAddress: 'BP 19',
    postalCode: '89010',
    city: 'AUXERRE CEDEX'
  },
  '90': {
    name: 'DDETSPP du Territoire de Belfort',
    street: 'Place de la Révolution Française',
    additionalAddress: 'BP90239',
    postalCode: '90004',
    city: 'BELFORT CEDEX'
  },
  '91': {
    name: "DDPP de l'Essonne",
    street: 'bd de France-Georges Pompidou',
    postalCode: '91080',
    city: 'EVRY COURCOURONNES'
  },
  '92': {
    name: 'DDPP des Hauts-de-Seine',
    locality: 'Cité administrative',
    street: '167-177 AVENUE JOLIOT CURIE',
    postalCode: '92013',
    city: 'NANTERRE CEDEX'
  },
  '93': {
    name: 'DDPP de la Seine-Saint-Denis',
    locality: "5 - 7 immeuble L'Europeen",
    street: '5 PROM JEAN ROSTAND',
    postalCode: '93000',
    city: 'BOBIGNY'
  },
  '94': {
    name: 'DDPP du Val-de-Marne',
    street: '3 B RUE DES ARCHIVES',
    postalCode: '94000',
    city: 'CRETEIL'
  },
  '95': {
    name: "DDPP du Val-d'Oise",
    locality: "Préfecture du Val d'Oise",
    street: '5 avenue Bernard Hirsch CS 20105',
    postalCode: '95010',
    city: 'CERGY-PONTOISE CEDEX'
  }
};
