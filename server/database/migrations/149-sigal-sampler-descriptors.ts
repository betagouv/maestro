import type { Knex } from 'knex';

const year = 2026;

const fields = [
  {
    key: 'CPLTSP',
    inputType: 'select',
    label: "Complément d'espèce",
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'CRITCIB',
    inputType: 'text',
    label: 'Précision critères de ciblage',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'DATFAB',
    inputType: 'date',
    label: 'Date de fabrication',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'DTLIVR',
    inputType: 'date',
    label: 'Date de livraison',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'ECHANT',
    inputType: 'select',
    label: 'Echantillonnage',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'ESPCOA',
    inputType: 'multiselect',
    label: 'Espèce traitée sur le site de production',
    sachaCommemoratifSigle: 'ESPCOA',
    sachaInDai: true
  },
  {
    key: 'ESPECDESTALI',
    inputType: 'select',
    label: "Espèce de destination de l'aliment",
    sachaCommemoratifSigle: 'ESPECDESTALI',
    sachaInDai: true
  },
  {
    key: 'FOURNI',
    inputType: 'text',
    label: 'Fournisseur',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'IDLOTAX',
    inputType: 'text',
    label: "Identification du lot ou de l'animal",
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'IDVEHICUL',
    inputType: 'text',
    label: 'Identification du véhicule',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'IMPORT',
    inputType: 'select',
    label: 'Importateur',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'METOFECH',
    inputType: 'select',
    label: "Méthode officielle d'échantillonnage",
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'NUMAGRE',
    inputType: 'text',
    label: 'Numéro agrément ou enregistrement',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'PAYORIG',
    inputType: 'select',
    label: "Pays d'origine",
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'TAILECH',
    inputType: 'decimal',
    label: 'Taille échantillon',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'TAILOT',
    inputType: 'decimal',
    label: 'Taille du lot (kg)',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'TYP_ALMNT',
    inputType: 'select',
    label: "Type d'aliment",
    sachaCommemoratifSigle: 'TYP_ALMNT',
    sachaInDai: true
  },
  {
    key: 'ABIOPREC',
    inputType: 'select',
    label: 'Certifié agriculture biologique',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'ETATDENR',
    inputType: 'select',
    label: 'Etat de la denrée',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'MARQ',
    inputType: 'text',
    label: 'Marque',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'NBUNITPREL',
    inputType: 'number',
    label: "Nombre d'unités prélevées",
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'PRODDENOM',
    inputType: 'text',
    label: 'Dénomination du produit',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'TLCHTKG',
    inputType: 'decimal',
    label: 'Taille échantillon (en kg)',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  },
  {
    key: 'TPCNDT2',
    inputType: 'select',
    label: 'Type de conditionnement',
    sachaCommemoratifSigle: null,
    sachaInDai: false
  }
];

const options = [
  {
    fieldKey: 'CPLTSP',
    value: 'AUTANXFAM',
    label: 'Autres animaux familiers',
    order: 1,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'CHAT',
    label: 'Chats',
    order: 2,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'CV',
    label: 'Equins',
    order: 3,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'JN_RMT',
    label: 'Jeunes ruminants',
    order: 4,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'JN_VOL',
    label: 'Jeunes volailles',
    order: 5,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'LP',
    label: 'Lapins',
    order: 6,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'PC',
    label: 'Porcins',
    order: 7,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'PCCH',
    label: "Porcs à l'engraissement",
    order: 8,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'PL_PND',
    label: 'Poules pondeuses',
    order: 9,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'PRCLT',
    label: 'Porcelets',
    order: 10,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'TRUI',
    label: 'Truies',
    order: 11,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'CPLTSP',
    value: 'VOL_HPND',
    label: 'Volailles hors pondeuses',
    order: 12,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ECHANT',
    value: 'ALEAT',
    label: 'Aléatoire',
    order: 1,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ECHANT',
    value: 'CIBLE',
    label: 'Ciblé (orienté)',
    order: 2,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ECHANT',
    value: 'SUSPECT',
    label: 'Suspect (renforcé)',
    order: 3,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ESPCOA',
    value: 'POIS',
    label: 'Poisson',
    order: 1,
    sachaCommemoratifValueSigle: 'POIS'
  },
  {
    fieldKey: 'ESPCOA',
    value: 'PORC',
    label: 'Porcin',
    order: 2,
    sachaCommemoratifValueSigle: 'PORC'
  },
  {
    fieldKey: 'ESPCOA',
    value: 'RUM',
    label: 'Ruminant',
    order: 3,
    sachaCommemoratifValueSigle: 'RUM'
  },
  {
    fieldKey: 'ESPCOA',
    value: 'VOL',
    label: 'Volailles',
    order: 4,
    sachaCommemoratifValueSigle: 'VOL'
  },
  {
    fieldKey: 'ESPECDESTALI',
    value: 'ANXFAM',
    label: 'Animaux familiers',
    order: 1,
    sachaCommemoratifValueSigle: 'ANXFAM'
  },
  {
    fieldKey: 'ESPECDESTALI',
    value: 'INCONN',
    label: 'Inconnue',
    order: 2,
    sachaCommemoratifValueSigle: 'INCONN'
  },
  {
    fieldKey: 'ESPECDESTALI',
    value: 'MONOPO',
    label: 'Monogastriques',
    order: 3,
    sachaCommemoratifValueSigle: 'MONOPO'
  },
  {
    fieldKey: 'ESPECDESTALI',
    value: 'PSS',
    label: 'Poissons',
    order: 4,
    sachaCommemoratifValueSigle: 'PSS'
  },
  {
    fieldKey: 'ESPECDESTALI',
    value: 'RUMINA',
    label: 'Ruminants',
    order: 5,
    sachaCommemoratifValueSigle: 'RUMINA'
  },
  {
    fieldKey: 'IMPORT',
    value: 'AGAA',
    label: 'Agrément - Alimentation animale',
    order: 1,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'ANCHA',
    label: 'Ancienne immatriculation HA',
    order: 2,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'BAS_CO',
    label: 'Numéro Basse-cour - IA 2006',
    order: 3,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'CGIDIC',
    label: 'Code GIDIC',
    order: 4,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'COEUF',
    label: 'Code Oeuf',
    order: 5,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'COFRAC',
    label: 'No accréditation COFRAC',
    order: 6,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'CSOPRO',
    label: 'Numéro CSO provisoire',
    order: 7,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'DEPADM',
    label: 'Numéro départemental',
    order: 8,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'DETEQU',
    label: 'Détenteur Equin',
    order: 9,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'DOSDSV',
    label: 'Numéro dossier DSV',
    order: 10,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'DOSGDS',
    label: 'Numéro dossier GDS',
    order: 11,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'EDE',
    label: "Numéro EDE d'exploitation",
    order: 12,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'EGET_P',
    label: 'Numéro EGET Porcin',
    order: 13,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'ELEVAG',
    label: "Identifiant d'élevage",
    order: 14,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'IDCONV',
    label: "Identifiant convoyeur d'animaux",
    order: 15,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'IDDPMA',
    label: 'Identifiant navire DPMA',
    order: 16,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'IDNAVP',
    label: 'Identifiant navire de pêche',
    order: 17,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'IDUE',
    label: 'Identifiant déplacement UE',
    order: 18,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'ID_ONA',
    label: 'Identifiant abattoir ONA',
    order: 19,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'ILU',
    label: 'Numéro local unique',
    order: 20,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'IM_PC',
    label: 'Indicatif de marquage porcin',
    order: 21,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'INUAV',
    label: 'Numéro unique atelier volailles',
    order: 22,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'LABO',
    label: 'Identifiant  laboratoire',
    order: 23,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'LAITER',
    label: 'Numéro de laiterie',
    order: 24,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'LIVLAI',
    label: 'Numéro de livraison laiterie',
    order: 25,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'MPLC',
    label: 'Code marché public local',
    order: 26,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'NAPC',
    label: 'Numéro apiculteur (DD0CCCnn)',
    order: 27,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'NAPD',
    label: 'Numéro apiculteur (DD00nnnn)',
    order: 28,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'NAPI',
    label: 'Numéro apiculteur (DDnnnnnn)',
    order: 29,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'NPAC',
    label: 'Numéro PACAGE',
    order: 30,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'ORDRE',
    label: 'Numéro inscription Ordre vét.',
    order: 31,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'POULA',
    label: 'Numéro de poulailler',
    order: 32,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'PPC_LC',
    label: 'PPC - Lot de chasse',
    order: 33,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'PREDE',
    label: 'Numéro provisoire EDE exploit.',
    order: 34,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'PROJET',
    label: 'Numéro de Projet',
    order: 35,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'REALOC',
    label: 'Numéro reprise appli. locale',
    order: 36,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'REHAII',
    label: 'Numéro reprise HAII',
    order: 37,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'RESA',
    label: 'Numéro secondaire reprise SANI',
    order: 38,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'SIREN',
    label: 'Numéro SIREN',
    order: 39,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'SIRET',
    label: 'Numéro SIRET',
    order: 40,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'TRAV',
    label: 'Numéro de travail',
    order: 41,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'TVA',
    label: 'Indicatif de marquage (N° TVA)',
    order: 42,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'TVAUE',
    label: 'Numéro TVA intra-communautaire',
    order: 43,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'UPRA',
    label: 'Numéro UPRA',
    order: 44,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'IMPORT',
    value: 'VEHIC',
    label: 'Numéro minéralogique du véhicule',
    order: 45,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'METOFECH',
    value: 'NON',
    label: 'Non',
    order: 1,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'METOFECH',
    value: 'OUI',
    label: 'Oui',
    order: 2,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: '3',
    label: 'Autres pays',
    order: 1,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: '??',
    label: 'ANTILLES NEERLANDAISES',
    order: 2,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: '?X',
    label: 'PALESTINE',
    order: 3,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: '?Y',
    label: 'PORTO-RICO',
    order: 4,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AD',
    label: 'ANDORRE',
    order: 5,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AE',
    label: 'EMIRATS ARABES UNIS',
    order: 6,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AF',
    label: 'AFGHANISTAN',
    order: 7,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AG',
    label: 'ANTIGUA-ET-BARBUDA',
    order: 8,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AL',
    label: 'ALBANIE',
    order: 9,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AM',
    label: 'ARMENIE',
    order: 10,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AO',
    label: 'ANGOLA',
    order: 11,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AR',
    label: 'ARGENTINE',
    order: 12,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AT',
    label: 'AUTRICHE',
    order: 13,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AU',
    label: 'AUSTRALIE',
    order: 14,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'AZ',
    label: 'AZERBAIDJAN',
    order: 15,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BA',
    label: 'BOSNIE-HERZEGOVINE',
    order: 16,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BB',
    label: 'BARBADE',
    order: 17,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BD',
    label: 'BANGLADESH',
    order: 18,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BE',
    label: 'BELGIQUE',
    order: 19,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BF',
    label: 'BURKINA',
    order: 20,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BG',
    label: 'BULGARIE',
    order: 21,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BH',
    label: 'BAHREIN',
    order: 22,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BI',
    label: 'BURUNDI',
    order: 23,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BJ',
    label: 'BENIN',
    order: 24,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BM',
    label: 'BERMUDES',
    order: 25,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BN',
    label: 'BRUNEI',
    order: 26,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BO',
    label: 'BOLIVIE',
    order: 27,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BR',
    label: 'BRESIL',
    order: 28,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BS',
    label: 'BAHAMAS',
    order: 29,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BT',
    label: 'BHOUTAN',
    order: 30,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BU',
    label: 'BIRMANIE',
    order: 31,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BW',
    label: 'BOTSWANA',
    order: 32,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BY',
    label: 'BIELORUSSIE',
    order: 33,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'BZ',
    label: 'BELIZE',
    order: 34,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CA',
    label: 'CANADA',
    order: 35,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CF',
    label: 'CENTRAFRICAINE (REPUBLIQUE)',
    order: 36,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CG',
    label: 'CONGO',
    order: 37,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CH',
    label: 'SUISSE',
    order: 38,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CI',
    label: "COTE D'IVOIRE",
    order: 39,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CL',
    label: 'CHILI',
    order: 40,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CM',
    label: 'CAMEROUN',
    order: 41,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CN',
    label: 'CHINE',
    order: 42,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CO',
    label: 'COLOMBIE',
    order: 43,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CR',
    label: 'COSTA RICA',
    order: 44,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CU',
    label: 'CUBA',
    order: 45,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CV',
    label: 'CAP-VERT',
    order: 46,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CY',
    label: 'CHYPRE',
    order: 47,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'CZ',
    label: 'TCHEQUE (REPUBLIQUE)',
    order: 48,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'DE',
    label: 'ALLEMAGNE',
    order: 49,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'DJ',
    label: 'DJIBOUTI',
    order: 50,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'DK',
    label: 'DANEMARK',
    order: 51,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'DM',
    label: 'DOMINIQUE',
    order: 52,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'DO',
    label: 'REPUBLIQUE DOMINICAINE',
    order: 53,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'DZ',
    label: 'ALGERIE',
    order: 54,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'EC',
    label: 'EQUATEUR',
    order: 55,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'EE',
    label: 'ESTONIE',
    order: 56,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'EG',
    label: 'EGYPTE',
    order: 57,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'EH',
    label: 'SAHARA OCCIDENTAL',
    order: 58,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ER',
    label: 'ERYTHREE',
    order: 59,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ES',
    label: 'ESPAGNE',
    order: 60,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ET',
    label: 'ETHIOPIE',
    order: 61,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'FI',
    label: 'FINLANDE',
    order: 62,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'FJ',
    label: 'FIDJI',
    order: 63,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'FM',
    label: 'MICRONESIE (ETATS FEDERES DE)',
    order: 64,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'FR',
    label: 'FRANCE',
    order: 65,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GA',
    label: 'GABON',
    order: 66,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GB',
    label: 'ROYAUME-UNI',
    order: 67,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GD',
    label: 'GRENADE',
    order: 68,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GE',
    label: 'GEORGIE',
    order: 69,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GH',
    label: 'GHANA',
    order: 70,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GL',
    label: 'GROENLAND',
    order: 71,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GM',
    label: 'GAMBIE',
    order: 72,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GN',
    label: 'GUINEE',
    order: 73,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GQ',
    label: 'GUINEE EQUATORIALE',
    order: 74,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GR',
    label: 'GRECE',
    order: 75,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GT',
    label: 'GUATEMALA',
    order: 76,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GW',
    label: 'GUINEE-BISSAU',
    order: 77,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'GY',
    label: 'GUYANA',
    order: 78,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'HN',
    label: 'HONDURAS',
    order: 79,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'HR',
    label: 'CROATIE',
    order: 80,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'HT',
    label: 'HAITI',
    order: 81,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'HU',
    label: 'HONGRIE',
    order: 82,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ID',
    label: 'INDONESIE',
    order: 83,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'IE',
    label: 'IRLANDE',
    order: 84,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'IL',
    label: 'ISRAEL',
    order: 85,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'IN',
    label: 'INDE',
    order: 86,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'IQ',
    label: 'IRAQ',
    order: 87,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'IR',
    label: 'IRAN',
    order: 88,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'IS',
    label: 'ISLANDE',
    order: 89,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'IT',
    label: 'ITALIE',
    order: 90,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'JM',
    label: 'JAMAIQUE',
    order: 91,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'JO',
    label: 'JORDANIE',
    order: 92,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'JP',
    label: 'JAPON',
    order: 93,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KE',
    label: 'KENYA',
    order: 94,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KG',
    label: 'KIRGHIZISTAN',
    order: 95,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KH',
    label: 'CAMBODGE',
    order: 96,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KI',
    label: 'KIRIBATI',
    order: 97,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KM',
    label: 'COMORES',
    order: 98,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KP',
    label: 'COREE (REPUBLIQUE POPULAIRE DEMOCRATIQUE DE)',
    order: 99,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KR',
    label: 'COREE (REPUBLIQUE DE)',
    order: 100,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KW',
    label: 'KOWEIT',
    order: 101,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'KZ',
    label: 'KAZAKHSTAN',
    order: 102,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LA',
    label: 'LAOS',
    order: 103,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LB',
    label: 'LIBAN',
    order: 104,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LC',
    label: 'SAINTE-LUCIE',
    order: 105,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LI',
    label: 'LIECHTENSTEIN',
    order: 106,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LK',
    label: 'SRI LANKA',
    order: 107,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LR',
    label: 'LIBERIA',
    order: 108,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LS',
    label: 'LESOTHO',
    order: 109,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LT',
    label: 'LITUANIE',
    order: 110,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LU',
    label: 'LUXEMBOURG',
    order: 111,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LV',
    label: 'LETTONIE',
    order: 112,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'LY',
    label: 'LIBYE',
    order: 113,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MA',
    label: 'MAROC',
    order: 114,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MC',
    label: 'MONACO',
    order: 115,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MD',
    label: 'MOLDAVIE',
    order: 116,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MG',
    label: 'MADAGASCAR',
    order: 117,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MH',
    label: 'MARSHALL (ILES)',
    order: 118,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MK',
    label: 'MACEDOINE DU NORD',
    order: 119,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ML',
    label: 'MALI',
    order: 120,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MN',
    label: 'MONGOLIE',
    order: 121,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MO',
    label: 'MACAO',
    order: 122,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MR',
    label: 'MAURITANIE',
    order: 123,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MT',
    label: 'MALTE',
    order: 124,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MU',
    label: 'MAURICE',
    order: 125,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MV',
    label: 'MALDIVES',
    order: 126,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MW',
    label: 'MALAWI',
    order: 127,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MX',
    label: 'MEXIQUE',
    order: 128,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MY',
    label: 'MALAISIE',
    order: 129,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'MZ',
    label: 'MOZAMBIQUE',
    order: 130,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NA',
    label: 'NAMIBIE',
    order: 131,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NE',
    label: 'NIGER',
    order: 132,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NG',
    label: 'NIGERIA',
    order: 133,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NI',
    label: 'NICARAGUA',
    order: 134,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NL',
    label: 'PAYS-BAS',
    order: 135,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NO',
    label: 'NORVEGE',
    order: 136,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NP',
    label: 'NEPAL',
    order: 137,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NR',
    label: 'NAURU',
    order: 138,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'NZ',
    label: 'NOUVELLE-ZELANDE',
    order: 139,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'OM',
    label: 'OMAN',
    order: 140,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PA',
    label: 'PANAMA',
    order: 141,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PE',
    label: 'PEROU',
    order: 142,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PG',
    label: 'PAPOUASIE-NOUVELLE-GUINEE',
    order: 143,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PH',
    label: 'PHILIPPINES',
    order: 144,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PK',
    label: 'PAKISTAN',
    order: 145,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PL',
    label: 'POLOGNE',
    order: 146,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PN',
    label: 'PITCAIRN (ILE)',
    order: 147,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PT',
    label: 'PORTUGAL',
    order: 148,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'PY',
    label: 'PARAGUAY',
    order: 149,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'QA',
    label: 'QATAR',
    order: 150,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'RO',
    label: 'ROUMANIE',
    order: 151,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'RU',
    label: 'RUSSIE',
    order: 152,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'RW',
    label: 'RWANDA',
    order: 153,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SA',
    label: 'ARABIE SAOUDITE',
    order: 154,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SB',
    label: 'SALOMON (ILES)',
    order: 155,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SC',
    label: 'SEYCHELLES',
    order: 156,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SD',
    label: 'SOUDAN',
    order: 157,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SE',
    label: 'SUEDE',
    order: 158,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SG',
    label: 'SINGAPOUR',
    order: 159,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SH',
    label: 'SAINTE-HELENE',
    order: 160,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SI',
    label: 'SLOVENIE',
    order: 161,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SK',
    label: 'SLOVAQUIE',
    order: 162,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SL',
    label: 'SIERRA LEONE',
    order: 163,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SM',
    label: 'SAINT-MARIN',
    order: 164,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SN',
    label: 'SENEGAL',
    order: 165,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SO',
    label: 'SOMALIE',
    order: 166,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SR',
    label: 'SURINAME',
    order: 167,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ST',
    label: 'SAO TOME-ET-PRINCIPE',
    order: 168,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SV',
    label: 'EL SALVADOR',
    order: 169,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SY',
    label: 'SYRIE',
    order: 170,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'SZ',
    label: 'SWAZILAND',
    order: 171,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TD',
    label: 'TCHAD',
    order: 172,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TG',
    label: 'TOGO',
    order: 173,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TH',
    label: 'THAILANDE',
    order: 174,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TJ',
    label: 'TADJIKISTAN',
    order: 175,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TM',
    label: 'TURKMENISTAN',
    order: 176,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TN',
    label: 'TUNISIE',
    order: 177,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TO',
    label: 'TONGA',
    order: 178,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TR',
    label: 'TURQUIE',
    order: 179,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TT',
    label: 'TRINITE-ET-TOBAGO',
    order: 180,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TV',
    label: 'TUVALU',
    order: 181,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TW',
    label: 'TAIWAN',
    order: 182,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'TZ',
    label: 'TANZANIE',
    order: 183,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'UA',
    label: 'UKRAINE',
    order: 184,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'UG',
    label: 'OUGANDA',
    order: 185,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'US',
    label: 'ETATS-UNIS',
    order: 186,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'UY',
    label: 'URUGUAY',
    order: 187,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'UZ',
    label: 'OUZBEKISTAN',
    order: 188,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'VA',
    label: 'VATICAN, ou SAINT-SIEGE',
    order: 189,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'VC',
    label: 'SAINT-VINCENT-ET-LES GRENADINES',
    order: 190,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'VE',
    label: 'VENEZUELA',
    order: 191,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'VN',
    label: 'VIET NAM',
    order: 192,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'VU',
    label: 'VANUATU',
    order: 193,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'WS',
    label: 'SAMOA OCCIDENTALES',
    order: 194,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'XA',
    label: 'ACORES, MADERE',
    order: 195,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'XB',
    label: 'CANARIES (ILES)',
    order: 196,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'YE',
    label: 'YEMEN',
    order: 197,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'YU',
    label: 'SERBIE',
    order: 198,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ZA',
    label: 'AFRIQUE DU SUD',
    order: 199,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ZM',
    label: 'ZAMBIE',
    order: 200,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ZR',
    label: 'ZAIRE',
    order: 201,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'PAYORIG',
    value: 'ZW',
    label: 'ZIMBABWE',
    order: 202,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'ACMPHMN',
    label: 'Aliment complementaire autre que mineral',
    order: 1,
    sachaCommemoratifValueSigle: 'ACMPHMN'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'ACMPMN',
    label: 'Aliment complementaire mineral',
    order: 2,
    sachaCommemoratifValueSigle: 'ACMPMN'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'ACPRMLT',
    label: 'Aliment composé pour ruminants laitiers',
    order: 3,
    sachaCommemoratifValueSigle: 'ACPRMLT'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'ADDTF',
    label: 'Additifs',
    order: 4,
    sachaCommemoratifValueSigle: 'ADDTF'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'ALMCMP',
    label: 'Aliment complet',
    order: 5,
    sachaCommemoratifValueSigle: 'ALMCMP'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'AUTR',
    label: 'Autre',
    order: 6,
    sachaCommemoratifValueSigle: 'AUTR'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'AUTR_TRT',
    label: 'Autre Tourteau',
    order: 7,
    sachaCommemoratifValueSigle: 'AUTR_TRT'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'AVN',
    label: 'Avoine',
    order: 8,
    sachaCommemoratifValueSigle: 'AVN'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'BLE',
    label: 'Blé',
    order: 9,
    sachaCommemoratifValueSigle: 'BLE'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'CRGF',
    label: 'Corn gluten feed',
    order: 10,
    sachaCommemoratifValueSigle: 'CRGF'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'CRL',
    label: 'Céréales',
    order: 11,
    sachaCommemoratifValueSigle: 'CRL'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'FRPLM',
    label: 'Farine de plume',
    order: 12,
    sachaCommemoratifValueSigle: 'FRPLM'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'FRPSS',
    label: 'Farine de poisson',
    order: 13,
    sachaCommemoratifValueSigle: 'FRPSS'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'FRRG',
    label: 'Fourrages',
    order: 14,
    sachaCommemoratifValueSigle: 'FRRG'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'FRSG',
    label: 'Farine de sang',
    order: 15,
    sachaCommemoratifValueSigle: 'FRSG'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'GRSNML',
    label: 'Graisses animales',
    order: 16,
    sachaCommemoratifValueSigle: 'GRSNML'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'HLPSS',
    label: 'Huile de poisson',
    order: 17,
    sachaCommemoratifValueSigle: 'HLPSS'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'HLVG',
    label: 'Huiles végétales',
    order: 18,
    sachaCommemoratifValueSigle: 'HLVG'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'MAI',
    label: 'Mais',
    order: 19,
    sachaCommemoratifValueSigle: 'MAI'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'MAIGRN',
    label: 'Mais grain',
    order: 20,
    sachaCommemoratifValueSigle: 'MAIGRN'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'MLT',
    label: 'Millet',
    order: 21,
    sachaCommemoratifValueSigle: 'MLT'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'MSSLG',
    label: 'Mais ensilage',
    order: 22,
    sachaCommemoratifValueSigle: 'MSSLG'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'MTPRAN',
    label: 'Matière première origine animale',
    order: 23,
    sachaCommemoratifValueSigle: 'MTPRAN'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'MTPRMN',
    label: 'Matière première origine minérale',
    order: 24,
    sachaCommemoratifValueSigle: 'MTPRMN'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'MTPRVG',
    label: "Matière première d'origine végétale",
    order: 25,
    sachaCommemoratifValueSigle: 'MTPRVG'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'ORG',
    label: 'Orge',
    order: 26,
    sachaCommemoratifValueSigle: 'ORG'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'OVPD',
    label: 'Ovoproduits',
    order: 27,
    sachaCommemoratifValueSigle: 'OVPD'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'PRDLT',
    label: 'Produits laitiers',
    order: 28,
    sachaCommemoratifValueSigle: 'PRDLT'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'PRDSGN',
    label: 'Produits sanguins',
    order: 29,
    sachaCommemoratifValueSigle: 'PRDSGN'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'PREMLNG',
    label: 'Prémélanges',
    order: 30,
    sachaCommemoratifValueSigle: 'PREMLNG'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'RIZ',
    label: 'Riz',
    order: 31,
    sachaCommemoratifValueSigle: 'RIZ'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'SGL',
    label: 'Seigle',
    order: 32,
    sachaCommemoratifValueSigle: 'SGL'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'SRG',
    label: 'Sorgho',
    order: 33,
    sachaCommemoratifValueSigle: 'SRG'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'TRTARACH',
    label: "Tourteau d'arachide",
    order: 34,
    sachaCommemoratifValueSigle: 'TRTARACH'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'TRTCZ',
    label: 'Tourteau de colza',
    order: 35,
    sachaCommemoratifValueSigle: 'TRTCZ'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'TRTLIN',
    label: 'Tourteau de lin',
    order: 36,
    sachaCommemoratifValueSigle: 'TRTLIN'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'TRTPALM',
    label: 'Tourteau de palmiste',
    order: 37,
    sachaCommemoratifValueSigle: 'TRTPALM'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'TRTSJ',
    label: 'Tourteau de soja',
    order: 38,
    sachaCommemoratifValueSigle: 'TRTSJ'
  },
  {
    fieldKey: 'TYP_ALMNT',
    value: 'TRTTNS',
    label: 'Tourteau de tournesol',
    order: 39,
    sachaCommemoratifValueSigle: 'TRTTNS'
  },
  {
    fieldKey: 'ABIOPREC',
    value: 'ND',
    label: 'Inconnu',
    order: 1,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ABIOPREC',
    value: 'NON',
    label: 'Non',
    order: 2,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ABIOPREC',
    value: 'OUI',
    label: 'Oui',
    order: 3,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ETATDENR',
    value: 'CONSRV',
    label: 'En conserve',
    order: 1,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ETATDENR',
    value: 'DESHY',
    label: 'Déshydraté',
    order: 2,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ETATDENR',
    value: 'FRAIS',
    label: 'Frais',
    order: 3,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ETATDENR',
    value: 'SCONSRV',
    label: 'En semi conserve',
    order: 4,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ETATDENR',
    value: 'SS_VID',
    label: 'Sous vide',
    order: 5,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ETATDENR',
    value: 'SURG',
    label: 'Surgelé',
    order: 6,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'ETATDENR',
    value: 'TEMP_AMB',
    label: 'Température ambiante',
    order: 7,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'TPCNDT2',
    value: 'EMB',
    label: 'Emballé',
    order: 1,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'TPCNDT2',
    value: 'VRAC',
    label: 'En vrac',
    order: 2,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'stage',
    value: 'ETA_ENST',
    label: "Etablissement d'entreposage et de stockage",
    order: 49,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'stage',
    value: 'MEU_AUT',
    label: 'Meunerie et autres activités du travail des grains',
    order: 50,
    sachaCommemoratifValueSigle: null
  },
  {
    fieldKey: 'stage',
    value: 'US_TRDE',
    label: 'Usine de transformation ou de découpe',
    order: 51,
    sachaCommemoratifValueSigle: null
  }
];

const planFields = [
  {
    programmingPlanTitle: 'Plan aliments pour animaux',
    subPlanNumber: '001',
    fields: [
      {
        fieldKey: 'CPLTSP',
        required: true,
        optionValues: [
          'AUTANXFAM',
          'CHAT',
          'CV',
          'JN_RMT',
          'JN_VOL',
          'LP',
          'PC',
          'PCCH',
          'PL_PND',
          'PRCLT',
          'TRUI',
          'VOL_HPND'
        ],
        order: 1
      },
      {
        fieldKey: 'CRITCIB',
        required: true,
        optionValues: [],
        order: 2
      },
      {
        fieldKey: 'DATFAB',
        required: true,
        optionValues: [],
        order: 3
      },
      {
        fieldKey: 'DTLIVR',
        required: true,
        optionValues: [],
        order: 4
      },
      {
        fieldKey: 'ECHANT',
        required: true,
        optionValues: ['ALEAT', 'CIBLE', 'SUSPECT'],
        order: 5
      },
      {
        fieldKey: 'ESPCOA',
        required: true,
        optionValues: ['POIS', 'PORC', 'RUM', 'VOL'],
        order: 6
      },
      {
        fieldKey: 'ESPECDESTALI',
        required: true,
        optionValues: ['ANXFAM', 'INCONN', 'MONOPO', 'PSS', 'RUMINA'],
        order: 7
      },
      {
        fieldKey: 'FOURNI',
        required: true,
        optionValues: [],
        order: 8
      },
      {
        fieldKey: 'IDLOTAX',
        required: true,
        optionValues: [],
        order: 9
      },
      {
        fieldKey: 'IDVEHICUL',
        required: true,
        optionValues: [],
        order: 10
      },
      {
        fieldKey: 'IMPORT',
        required: true,
        optionValues: [
          'AGAA',
          'ANCHA',
          'BAS_CO',
          'CGIDIC',
          'COEUF',
          'COFRAC',
          'CSOPRO',
          'DEPADM',
          'DETEQU',
          'DOSDSV',
          'DOSGDS',
          'EDE',
          'EGET_P',
          'ELEVAG',
          'IDCONV',
          'IDDPMA',
          'IDNAVP',
          'IDUE',
          'ID_ONA',
          'ILU',
          'IM_PC',
          'INUAV',
          'LABO',
          'LAITER',
          'LIVLAI',
          'MPLC',
          'NAPC',
          'NAPD',
          'NAPI',
          'NPAC',
          'ORDRE',
          'POULA',
          'PPC_LC',
          'PREDE',
          'PROJET',
          'REALOC',
          'REHAII',
          'RESA',
          'SIREN',
          'SIRET',
          'TRAV',
          'TVA',
          'TVAUE',
          'UPRA',
          'VEHIC'
        ],
        order: 11
      },
      {
        fieldKey: 'METOFECH',
        required: true,
        optionValues: ['NON', 'OUI'],
        order: 12
      },
      {
        fieldKey: 'NUMAGRE',
        required: true,
        optionValues: [],
        order: 13
      },
      {
        fieldKey: 'PAYORIG',
        required: true,
        optionValues: [
          '3',
          '??',
          '?X',
          '?Y',
          'AD',
          'AE',
          'AF',
          'AG',
          'AL',
          'AM',
          'AO',
          'AR',
          'AT',
          'AU',
          'AZ',
          'BA',
          'BB',
          'BD',
          'BE',
          'BF',
          'BG',
          'BH',
          'BI',
          'BJ',
          'BM',
          'BN',
          'BO',
          'BR',
          'BS',
          'BT',
          'BU',
          'BW',
          'BY',
          'BZ',
          'CA',
          'CF',
          'CG',
          'CH',
          'CI',
          'CL',
          'CM',
          'CN',
          'CO',
          'CR',
          'CU',
          'CV',
          'CY',
          'CZ',
          'DE',
          'DJ',
          'DK',
          'DM',
          'DO',
          'DZ',
          'EC',
          'EE',
          'EG',
          'EH',
          'ER',
          'ES',
          'ET',
          'FI',
          'FJ',
          'FM',
          'FR',
          'GA',
          'GB',
          'GD',
          'GE',
          'GH',
          'GL',
          'GM',
          'GN',
          'GQ',
          'GR',
          'GT',
          'GW',
          'GY',
          'HN',
          'HR',
          'HT',
          'HU',
          'ID',
          'IE',
          'IL',
          'IN',
          'IQ',
          'IR',
          'IS',
          'IT',
          'JM',
          'JO',
          'JP',
          'KE',
          'KG',
          'KH',
          'KI',
          'KM',
          'KP',
          'KR',
          'KW',
          'KZ',
          'LA',
          'LB',
          'LC',
          'LI',
          'LK',
          'LR',
          'LS',
          'LT',
          'LU',
          'LV',
          'LY',
          'MA',
          'MC',
          'MD',
          'MG',
          'MH',
          'MK',
          'ML',
          'MN',
          'MO',
          'MR',
          'MT',
          'MU',
          'MV',
          'MW',
          'MX',
          'MY',
          'MZ',
          'NA',
          'NE',
          'NG',
          'NI',
          'NL',
          'NO',
          'NP',
          'NR',
          'NZ',
          'OM',
          'PA',
          'PE',
          'PG',
          'PH',
          'PK',
          'PL',
          'PN',
          'PT',
          'PY',
          'QA',
          'RO',
          'RU',
          'RW',
          'SA',
          'SB',
          'SC',
          'SD',
          'SE',
          'SG',
          'SH',
          'SI',
          'SK',
          'SL',
          'SM',
          'SN',
          'SO',
          'SR',
          'ST',
          'SV',
          'SY',
          'SZ',
          'TD',
          'TG',
          'TH',
          'TJ',
          'TM',
          'TN',
          'TO',
          'TR',
          'TT',
          'TV',
          'TW',
          'TZ',
          'UA',
          'UG',
          'US',
          'UY',
          'UZ',
          'VA',
          'VC',
          'VE',
          'VN',
          'VU',
          'WS',
          'XA',
          'XB',
          'YE',
          'YU',
          'ZA',
          'ZM',
          'ZR',
          'ZW'
        ],
        order: 14
      },
      {
        fieldKey: 'TAILECH',
        required: true,
        optionValues: [],
        order: 15
      },
      {
        fieldKey: 'TAILOT',
        required: true,
        optionValues: [],
        order: 16
      },
      {
        fieldKey: 'TYP_ALMNT',
        required: true,
        optionValues: [
          'ACMPHMN',
          'ACMPMN',
          'ACPRMLT',
          'ADDTF',
          'ALMCMP',
          'AUTR',
          'AUTR_TRT',
          'AVN',
          'BLE',
          'CRGF',
          'CRL',
          'FRPLM',
          'FRPSS',
          'FRRG',
          'FRSG',
          'GRSNML',
          'HLPSS',
          'HLVG',
          'MAI',
          'MAIGRN',
          'MLT',
          'MSSLG',
          'MTPRAN',
          'MTPRMN',
          'MTPRVG',
          'ORG',
          'OVPD',
          'PRDLT',
          'PRDSGN',
          'PREMLNG',
          'RIZ',
          'SGL',
          'SRG',
          'TRTARACH',
          'TRTCZ',
          'TRTLIN',
          'TRTPALM',
          'TRTSJ',
          'TRTTNS'
        ],
        order: 17
      }
    ]
  }
];

const subPlanFields = [
  {
    acte: 'PR17_2026_PCHD_PDAOV',
    subPlanNumbers: ['619', '620'],
    fields: [
      {
        fieldKey: 'ABIOPREC',
        required: true,
        optionValues: ['ND', 'NON', 'OUI'],
        order: 1
      },
      {
        fieldKey: 'CRITCIB',
        required: true,
        optionValues: [],
        order: 2
      },
      {
        fieldKey: 'ECHANT',
        required: true,
        optionValues: ['ALEAT', 'CIBLE', 'SUSPECT'],
        order: 3
      },
      {
        fieldKey: 'ETATDENR',
        required: true,
        optionValues: [
          'CONSRV',
          'DESHY',
          'FRAIS',
          'SCONSRV',
          'SS_VID',
          'SURG',
          'TEMP_AMB'
        ],
        order: 4
      },
      {
        fieldKey: 'FOURNI',
        required: true,
        optionValues: [],
        order: 5
      },
      {
        fieldKey: 'MARQ',
        required: true,
        optionValues: [],
        order: 6
      },
      {
        fieldKey: 'NBUNITPREL',
        required: true,
        optionValues: [],
        order: 7
      },
      {
        fieldKey: 'PAYORIG',
        required: true,
        optionValues: [
          '3',
          '??',
          '?X',
          '?Y',
          'AD',
          'AE',
          'AF',
          'AG',
          'AL',
          'AM',
          'AO',
          'AR',
          'AT',
          'AU',
          'AZ',
          'BA',
          'BB',
          'BD',
          'BE',
          'BF',
          'BG',
          'BH',
          'BI',
          'BJ',
          'BM',
          'BN',
          'BO',
          'BR',
          'BS',
          'BT',
          'BU',
          'BW',
          'BY',
          'BZ',
          'CA',
          'CF',
          'CG',
          'CH',
          'CI',
          'CL',
          'CM',
          'CN',
          'CO',
          'CR',
          'CU',
          'CV',
          'CY',
          'CZ',
          'DE',
          'DJ',
          'DK',
          'DM',
          'DO',
          'DZ',
          'EC',
          'EE',
          'EG',
          'EH',
          'ER',
          'ES',
          'ET',
          'FI',
          'FJ',
          'FM',
          'FR',
          'GA',
          'GB',
          'GD',
          'GE',
          'GH',
          'GL',
          'GM',
          'GN',
          'GQ',
          'GR',
          'GT',
          'GW',
          'GY',
          'HN',
          'HR',
          'HT',
          'HU',
          'ID',
          'IE',
          'IL',
          'IN',
          'IQ',
          'IR',
          'IS',
          'IT',
          'JM',
          'JO',
          'JP',
          'KE',
          'KG',
          'KH',
          'KI',
          'KM',
          'KP',
          'KR',
          'KW',
          'KZ',
          'LA',
          'LB',
          'LC',
          'LI',
          'LK',
          'LR',
          'LS',
          'LT',
          'LU',
          'LV',
          'LY',
          'MA',
          'MC',
          'MD',
          'MG',
          'MH',
          'MK',
          'ML',
          'MN',
          'MO',
          'MR',
          'MT',
          'MU',
          'MV',
          'MW',
          'MX',
          'MY',
          'MZ',
          'NA',
          'NE',
          'NG',
          'NI',
          'NL',
          'NO',
          'NP',
          'NR',
          'NZ',
          'OM',
          'PA',
          'PE',
          'PG',
          'PH',
          'PK',
          'PL',
          'PN',
          'PT',
          'PY',
          'QA',
          'RO',
          'RU',
          'RW',
          'SA',
          'SB',
          'SC',
          'SD',
          'SE',
          'SG',
          'SH',
          'SI',
          'SK',
          'SL',
          'SM',
          'SN',
          'SO',
          'SR',
          'ST',
          'SV',
          'SY',
          'SZ',
          'TD',
          'TG',
          'TH',
          'TJ',
          'TM',
          'TN',
          'TO',
          'TR',
          'TT',
          'TV',
          'TW',
          'TZ',
          'UA',
          'UG',
          'US',
          'UY',
          'UZ',
          'VA',
          'VC',
          'VE',
          'VN',
          'VU',
          'WS',
          'XA',
          'XB',
          'YE',
          'YU',
          'ZA',
          'ZM',
          'ZR',
          'ZW'
        ],
        order: 8
      },
      {
        fieldKey: 'PRODDENOM',
        required: true,
        optionValues: [],
        order: 9
      },
      {
        fieldKey: 'TAILOT',
        required: true,
        optionValues: [],
        order: 11
      },
      {
        fieldKey: 'TLCHTKG',
        required: true,
        optionValues: [],
        order: 12
      },
      {
        fieldKey: 'TPCNDT2',
        required: true,
        optionValues: ['EMB', 'VRAC'],
        order: 13
      }
    ]
  }
];

const subPlanFieldReplacements = [
  {
    subPlanNumber: '619',
    fieldKey: 'stage',
    previous: {
      required: true,
      optionValues: ['STADE37']
    },
    next: {
      required: true,
      optionValues: ['STADE15', 'STADE16', 'ETA_ENST', 'MEU_AUT', 'US_TRDE']
    }
  },
  {
    subPlanNumber: '620',
    fieldKey: 'stage',
    previous: {
      required: true,
      optionValues: ['STADE37']
    },
    next: {
      required: true,
      optionValues: ['STADE15', 'STADE16', 'ETA_ENST', 'MEU_AUT', 'US_TRDE']
    }
  }
];

const sachaContextSigles = [
  {
    subPlanNumber: '546',
    sachaContextSigle: 'PR17_2026_PAAR_PCAA'
  },
  {
    subPlanNumber: '905',
    sachaContextSigle: 'PR17_2026_PAAR_PCAA'
  },
  {
    subPlanNumber: '906',
    sachaContextSigle: 'PR17_2026_PAAR_PCAA'
  },
  {
    subPlanNumber: '909',
    sachaContextSigle: 'PR17_2026_PAAR_PCAA'
  },
  {
    subPlanNumber: '999',
    sachaContextSigle: 'PR17_2026_PAAR_PCAA'
  },
  {
    subPlanNumber: 'A98',
    sachaContextSigle: 'PR17_2026_PAAR_PCSC'
  },
  {
    subPlanNumber: 'A99',
    sachaContextSigle: 'PR17_2026_PAAR_PCSC'
  },
  {
    subPlanNumber: 'A31',
    sachaContextSigle: 'PR17_2026_PAAR_PSAA'
  },
  {
    subPlanNumber: 'A32',
    sachaContextSigle: 'PR17_2026_PAAR_PSAA'
  },
  {
    subPlanNumber: 'A33',
    sachaContextSigle: 'PR17_2026_PAAR_PSAA'
  },
  {
    subPlanNumber: 'A34',
    sachaContextSigle: 'PR17_2026_PAAR_PSAA'
  },
  {
    subPlanNumber: 'A35',
    sachaContextSigle: 'PR17_2026_PAAR_PSAA'
  },
  {
    subPlanNumber: '001',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '002',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '003',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '004',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '005',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '006',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '007',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '008',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '009',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '010',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '011',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '012',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '013',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '014',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '015',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '016',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '017',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '018',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '019',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '020',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '021',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '022',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '023',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '024',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '025',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '026',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '027',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '028',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '029',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '030',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '031',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '032',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '033',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '034',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '035',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '036',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '037',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '038',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '039',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '040',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '041',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '042',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '043',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '044',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '045',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '046',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '047',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '048',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '049',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '050',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '051',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '053',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '054',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '055',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '056',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '057',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '058',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '059',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '060',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '061',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '062',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '063',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '064',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '065',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '066',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '067',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '068',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '069',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '096',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '097',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '185',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '186',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '187',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '188',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '189',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '229',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '230',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '231',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '232',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '238',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '239',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '240',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '241',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '447',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '448',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '449',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '450',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '451',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '452',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '453',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '454',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '455',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '456',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '457',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '458',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '459',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '460',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '462',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '463',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '464',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '465',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '466',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '467',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '468',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '470',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '471',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '472',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '473',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '474',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '475',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '476',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '477',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '478',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '479',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '480',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '481',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '482',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '483',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '484',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '485',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '486',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '487',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '488',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '489',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '490',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '491',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '492',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '493',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '494',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '495',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '496',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '497',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '498',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '500',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '501',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '502',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '503',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '504',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '505',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '506',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '630',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '631',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '634',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '635',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '636',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '637',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '639',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '640',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '641',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '642',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '643',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '644',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '645',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '646',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '659',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '660',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '661',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '662',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '663',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '664',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '665',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '666',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '667',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '668',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '669',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '670',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '734',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '735',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '736',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '737',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '738',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '739',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '741',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '742',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '743',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '744',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '745',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '747',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '750',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '751',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '752',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '753',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '755',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '756',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '757',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '758',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '759',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '760',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '761',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '762',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '763',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '764',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '765',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '766',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '767',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '768',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '769',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '770',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '778',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '779',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '780',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '781',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '782',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '783',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '784',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '785',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '786',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '787',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '788',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '789',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '790',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '792',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '793',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '794',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '795',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '796',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '797',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '798',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '800',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '801',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '802',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '803',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '804',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '805',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '806',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '807',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '808',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '809',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '810',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '811',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '812',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '813',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '814',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '815',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '816',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '817',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '818',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '819',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '821',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '822',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '823',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '824',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '825',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '950',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '951',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '952',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '953',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '954',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '955',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '956',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '957',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '958',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '959',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '960',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '961',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '962',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '963',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '964',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '965',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '966',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '967',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '968',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '969',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '970',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '971',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '972',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '973',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '974',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '975',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '976',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '977',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '978',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '979',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '985',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '986',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '987',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '988',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '989',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '990',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '991',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '992',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A09',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A10',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A12',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A13',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A14',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A15',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A17',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A18',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A19',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A20',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A21',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A22',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A23',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A24',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A25',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A26',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A27',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A28',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A29',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: 'A30',
    sachaContextSigle: 'PR17_2026_PALA_PALA'
  },
  {
    subPlanNumber: '700',
    sachaContextSigle: 'PR17_2026_PARE_PALVOL'
  },
  {
    subPlanNumber: '701',
    sachaContextSigle: 'PR17_2026_PARE_PALVOL'
  },
  {
    subPlanNumber: '329',
    sachaContextSigle: 'PR17_2026_PCCH_PALCOOL'
  },
  {
    subPlanNumber: '335',
    sachaContextSigle: 'PR17_2026_PCCH_PALCOOL'
  },
  {
    subPlanNumber: '336',
    sachaContextSigle: 'PR17_2026_PCCH_PALCOOL'
  },
  {
    subPlanNumber: '337',
    sachaContextSigle: 'PR17_2026_PCCH_PALCOOL'
  },
  {
    subPlanNumber: '338',
    sachaContextSigle: 'PR17_2026_PCCH_PALCOOL'
  },
  {
    subPlanNumber: '339',
    sachaContextSigle: 'PR17_2026_PCCH_PALCOOL'
  },
  {
    subPlanNumber: 'A48',
    sachaContextSigle: 'PR17_2026_PCCH_PALCOOL'
  },
  {
    subPlanNumber: '837',
    sachaContextSigle: 'PR17_2026_PCCH_PBOV'
  },
  {
    subPlanNumber: '840',
    sachaContextSigle: 'PR17_2026_PCCH_PBOV'
  },
  {
    subPlanNumber: '843',
    sachaContextSigle: 'PR17_2026_PCCH_PBOV'
  },
  {
    subPlanNumber: '927',
    sachaContextSigle: 'PR17_2026_PCCH_PBOV'
  },
  {
    subPlanNumber: '117',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '610',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '612',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '614',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '622',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '623',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '648',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '652',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '653',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '654',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '672',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '674',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '677',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '678',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '681',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '682',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '683',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '684',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '685',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '686',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '687',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '688',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '689',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '690',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '691',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '692',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '696',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '697',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '703',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '705',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '707',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '708',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '907',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A67',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A68',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A69',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A70',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A71',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A72',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A73',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A74',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A76',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A77',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A78',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A80',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A83',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A84',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A85',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A86',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A87',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A88',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A89',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: 'A90',
    sachaContextSigle: 'PR17_2026_PCCH_PCEREAL'
  },
  {
    subPlanNumber: '052',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '592',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '593',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '595',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '597',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '598',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '606',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '607',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '608',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: 'A49',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: 'A50',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: 'A51',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: 'A52',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: 'A53',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: 'A54',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPAL'
  },
  {
    subPlanNumber: '199',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '212',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '222',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '223',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '300',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '307',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '323',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '326',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '396',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: 'A56',
    sachaContextSigle: 'PR17_2026_PCCH_PCOMPO'
  },
  {
    subPlanNumber: '353',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: '354',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: '355',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: '356',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: '357',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: '358',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: '359',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: '908',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: 'A55',
    sachaContextSigle: 'PR17_2026_PCCH_PCONCHO'
  },
  {
    subPlanNumber: 'A01',
    sachaContextSigle: 'PR17_2026_PCCH_PEPISEC'
  },
  {
    subPlanNumber: 'A02',
    sachaContextSigle: 'PR17_2026_PCCH_PEPISEC'
  },
  {
    subPlanNumber: 'A03',
    sachaContextSigle: 'PR17_2026_PCCH_PEPISEC'
  },
  {
    subPlanNumber: 'A04',
    sachaContextSigle: 'PR17_2026_PCCH_PEPISEC'
  },
  {
    subPlanNumber: 'A05',
    sachaContextSigle: 'PR17_2026_PCCH_PEPISEC'
  },
  {
    subPlanNumber: 'A06',
    sachaContextSigle: 'PR17_2026_PCCH_PEPISEC'
  },
  {
    subPlanNumber: 'A07',
    sachaContextSigle: 'PR17_2026_PCCH_PEPISEC'
  },
  {
    subPlanNumber: 'A08',
    sachaContextSigle: 'PR17_2026_PCCH_PEPISEC'
  },
  {
    subPlanNumber: '076',
    sachaContextSigle: 'PR17_2026_PCCH_PEQU'
  },
  {
    subPlanNumber: '151',
    sachaContextSigle: 'PR17_2026_PCCH_PEQU'
  },
  {
    subPlanNumber: '164',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUCOQ'
  },
  {
    subPlanNumber: '166',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUCOQ'
  },
  {
    subPlanNumber: '170',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUCOQ'
  },
  {
    subPlanNumber: '181',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUCOQ'
  },
  {
    subPlanNumber: '191',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUCOQ'
  },
  {
    subPlanNumber: '192',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUCOQ'
  },
  {
    subPlanNumber: 'A91',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUCOQ'
  },
  {
    subPlanNumber: 'A92',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUCOQ'
  },
  {
    subPlanNumber: '929',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '934',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '935',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '941',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '943',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '993',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '994',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '995',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '998',
    sachaContextSigle: 'PR17_2026_PCCH_PFRUITS'
  },
  {
    subPlanNumber: '190',
    sachaContextSigle: 'PR17_2026_PCCH_PGIB'
  },
  {
    subPlanNumber: '880',
    sachaContextSigle: 'PR17_2026_PCCH_PGIB'
  },
  {
    subPlanNumber: '364',
    sachaContextSigle: 'PR17_2026_PCCH_PGRAVEG'
  },
  {
    subPlanNumber: '365',
    sachaContextSigle: 'PR17_2026_PCCH_PGRAVEG'
  },
  {
    subPlanNumber: '366',
    sachaContextSigle: 'PR17_2026_PCCH_PGRAVEG'
  },
  {
    subPlanNumber: '367',
    sachaContextSigle: 'PR17_2026_PCCH_PGRAVEG'
  },
  {
    subPlanNumber: '469',
    sachaContextSigle: 'PR17_2026_PCCH_PGRAVEG'
  },
  {
    subPlanNumber: '866',
    sachaContextSigle: 'PR17_2026_PCCH_PGRAVEG'
  },
  {
    subPlanNumber: 'A96',
    sachaContextSigle: 'PR17_2026_PCCH_PGRAVEG'
  },
  {
    subPlanNumber: '080',
    sachaContextSigle: 'PR17_2026_PCCH_PGRHAM'
  },
  {
    subPlanNumber: '363',
    sachaContextSigle: 'PR17_2026_PCCH_PGRHAM'
  },
  {
    subPlanNumber: '174',
    sachaContextSigle: 'PR17_2026_PCCH_PJUSNEC'
  },
  {
    subPlanNumber: '175',
    sachaContextSigle: 'PR17_2026_PCCH_PJUSNEC'
  },
  {
    subPlanNumber: '177',
    sachaContextSigle: 'PR17_2026_PCCH_PJUSNEC'
  },
  {
    subPlanNumber: '178',
    sachaContextSigle: 'PR17_2026_PCCH_PJUSNEC'
  },
  {
    subPlanNumber: '393',
    sachaContextSigle: 'PR17_2026_PCCH_PJUSNEC'
  },
  {
    subPlanNumber: '200',
    sachaContextSigle: 'PR17_2026_PCCH_PLAP'
  },
  {
    subPlanNumber: '205',
    sachaContextSigle: 'PR17_2026_PCCH_PLAP'
  },
  {
    subPlanNumber: '305',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '317',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '318',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '327',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '328',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '657',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '888',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '891',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '892',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '893',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: 'A97',
    sachaContextSigle: 'PR17_2026_PCCH_PLAT'
  },
  {
    subPlanNumber: '092',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGSEC'
  },
  {
    subPlanNumber: '394',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGSEC'
  },
  {
    subPlanNumber: '710',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '712',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '713',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '715',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '716',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '717',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '718',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '720',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '721',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '722',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '723',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '726',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '730',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '731',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '774',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '831',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '854',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '856',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '857',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '858',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '859',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '860',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '861',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '868',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '876',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A57',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A58',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A59',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A60',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A61',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A62',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A63',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A64',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A65',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: 'A66',
    sachaContextSigle: 'PR17_2026_PCCH_PLEGUM'
  },
  {
    subPlanNumber: '172',
    sachaContextSigle: 'PR17_2026_PCCH_PMIE'
  },
  {
    subPlanNumber: '173',
    sachaContextSigle: 'PR17_2026_PCCH_PMIE'
  },
  {
    subPlanNumber: '340',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '341',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '344',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '345',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '351',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '362',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '368',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '385',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '387',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '388',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '389',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '390',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '523',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '524',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '525',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '526',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '529',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '530',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '532',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '533',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '555',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '596',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '865',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: 'A39',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: 'A40',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: 'A41',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: 'A43',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: 'A44',
    sachaContextSigle: 'PR17_2026_PCCH_PNOURR'
  },
  {
    subPlanNumber: '218',
    sachaContextSigle: 'PR17_2026_PCCH_POEU'
  },
  {
    subPlanNumber: '370',
    sachaContextSigle: 'PR17_2026_PCCH_POEU'
  },
  {
    subPlanNumber: '371',
    sachaContextSigle: 'PR17_2026_PCCH_POEU'
  },
  {
    subPlanNumber: '894',
    sachaContextSigle: 'PR17_2026_PCCH_POEU'
  },
  {
    subPlanNumber: '896',
    sachaContextSigle: 'PR17_2026_PCCH_POEU'
  },
  {
    subPlanNumber: '392',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '535',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '541',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '542',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '543',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '544',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '549',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '550',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '557',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '558',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: 'A93',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: 'A94',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: 'A95',
    sachaContextSigle: 'PR17_2026_PCCH_POLEAG'
  },
  {
    subPlanNumber: '149',
    sachaContextSigle: 'PR17_2026_PCCH_POVCA'
  },
  {
    subPlanNumber: '838',
    sachaContextSigle: 'PR17_2026_PCCH_POVCA'
  },
  {
    subPlanNumber: '845',
    sachaContextSigle: 'PR17_2026_PCCH_POVCA'
  },
  {
    subPlanNumber: '936',
    sachaContextSigle: 'PR17_2026_PCCH_POVCA'
  },
  {
    subPlanNumber: '938',
    sachaContextSigle: 'PR17_2026_PCCH_POVCA'
  },
  {
    subPlanNumber: '942',
    sachaContextSigle: 'PR17_2026_PCCH_POVCA'
  },
  {
    subPlanNumber: '944',
    sachaContextSigle: 'PR17_2026_PCCH_POVCA'
  },
  {
    subPlanNumber: '075',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '077',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '078',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '079',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '352',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '360',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '361',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '369',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '372',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '373',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '376',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '377',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '378',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '379',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '380',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '381',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '382',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '383',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '384',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '386',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '397',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '398',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '675',
    sachaContextSigle: 'PR17_2026_PCCH_PPEC'
  },
  {
    subPlanNumber: '073',
    sachaContextSigle: 'PR17_2026_PCCH_PPEL'
  },
  {
    subPlanNumber: '227',
    sachaContextSigle: 'PR17_2026_PCCH_PPEL'
  },
  {
    subPlanNumber: '673',
    sachaContextSigle: 'PR17_2026_PCCH_PPEL'
  },
  {
    subPlanNumber: '885',
    sachaContextSigle: 'PR17_2026_PCCH_PPEL'
  },
  {
    subPlanNumber: '836',
    sachaContextSigle: 'PR17_2026_PCCH_PPOR'
  },
  {
    subPlanNumber: '841',
    sachaContextSigle: 'PR17_2026_PCCH_PPOR'
  },
  {
    subPlanNumber: '844',
    sachaContextSigle: 'PR17_2026_PCCH_PPOR'
  },
  {
    subPlanNumber: '902',
    sachaContextSigle: 'PR17_2026_PCCH_PPOR'
  },
  {
    subPlanNumber: '129',
    sachaContextSigle: 'PR17_2026_PCCH_PSAUCES'
  },
  {
    subPlanNumber: '130',
    sachaContextSigle: 'PR17_2026_PCCH_PSAUCES'
  },
  {
    subPlanNumber: '135',
    sachaContextSigle: 'PR17_2026_PCCH_PSAUCES'
  },
  {
    subPlanNumber: 'A47',
    sachaContextSigle: 'PR17_2026_PCCH_PSAUCES'
  },
  {
    subPlanNumber: '404',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '881',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '884',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '886',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '887',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '897',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '899',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '900',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '901',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '921',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '922',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '940',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '945',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '996',
    sachaContextSigle: 'PR17_2026_PCCH_PTHECAF'
  },
  {
    subPlanNumber: '400',
    sachaContextSigle: 'PR17_2026_PCCH_PTROA'
  },
  {
    subPlanNumber: '401',
    sachaContextSigle: 'PR17_2026_PCCH_PTROA'
  },
  {
    subPlanNumber: '402',
    sachaContextSigle: 'PR17_2026_PCCH_PTROA'
  },
  {
    subPlanNumber: '867',
    sachaContextSigle: 'PR17_2026_PCCH_PTROA'
  },
  {
    subPlanNumber: 'A45',
    sachaContextSigle: 'PR17_2026_PCCH_PTROA'
  },
  {
    subPlanNumber: 'A46',
    sachaContextSigle: 'PR17_2026_PCCH_PTROA'
  },
  {
    subPlanNumber: '246',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '258',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '271',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '283',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '374',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '375',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '846',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '848',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '869',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '870',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '871',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '872',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '873',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '874',
    sachaContextSigle: 'PR17_2026_PCCH_PVOL'
  },
  {
    subPlanNumber: '430',
    sachaContextSigle: 'PR17_2026_PCHD_PBOV'
  },
  {
    subPlanNumber: '438',
    sachaContextSigle: 'PR17_2026_PCHD_PBOV'
  },
  {
    subPlanNumber: '439',
    sachaContextSigle: 'PR17_2026_PCHD_PBOV'
  },
  {
    subPlanNumber: '440',
    sachaContextSigle: 'PR17_2026_PCHD_PBOV'
  },
  {
    subPlanNumber: '619',
    sachaContextSigle: 'PR17_2026_PCHD_PDAOV'
  },
  {
    subPlanNumber: '620',
    sachaContextSigle: 'PR17_2026_PCHD_PDAOV'
  },
  {
    subPlanNumber: '436',
    sachaContextSigle: 'PR17_2026_PCHD_PEQU'
  },
  {
    subPlanNumber: '446',
    sachaContextSigle: 'PR17_2026_PCHD_PEQU'
  },
  {
    subPlanNumber: '433',
    sachaContextSigle: 'PR17_2026_PCHD_POEU'
  },
  {
    subPlanNumber: '443',
    sachaContextSigle: 'PR17_2026_PCHD_POEU'
  },
  {
    subPlanNumber: '432',
    sachaContextSigle: 'PR17_2026_PCHD_POVCA'
  },
  {
    subPlanNumber: '437',
    sachaContextSigle: 'PR17_2026_PCHD_POVCA'
  },
  {
    subPlanNumber: '442',
    sachaContextSigle: 'PR17_2026_PCHD_POVCA'
  },
  {
    subPlanNumber: '615',
    sachaContextSigle: 'PR17_2026_PCHD_PPEC'
  },
  {
    subPlanNumber: '616',
    sachaContextSigle: 'PR17_2026_PCHD_PPEC'
  },
  {
    subPlanNumber: '617',
    sachaContextSigle: 'PR17_2026_PCHD_PPEC'
  },
  {
    subPlanNumber: '618',
    sachaContextSigle: 'PR17_2026_PCHD_PPEC'
  },
  {
    subPlanNumber: '625',
    sachaContextSigle: 'PR17_2026_PCHD_PPEC'
  },
  {
    subPlanNumber: '626',
    sachaContextSigle: 'PR17_2026_PCHD_PPEC'
  },
  {
    subPlanNumber: '627',
    sachaContextSigle: 'PR17_2026_PCHD_PPEC'
  },
  {
    subPlanNumber: '629',
    sachaContextSigle: 'PR17_2026_PCHD_PPEC'
  },
  {
    subPlanNumber: '445',
    sachaContextSigle: 'PR17_2026_PCHD_PPEL'
  },
  {
    subPlanNumber: '431',
    sachaContextSigle: 'PR17_2026_PCHD_PPOR'
  },
  {
    subPlanNumber: '441',
    sachaContextSigle: 'PR17_2026_PCHD_PPOR'
  },
  {
    subPlanNumber: '434',
    sachaContextSigle: 'PR17_2026_PCHD_PVOL'
  },
  {
    subPlanNumber: '435',
    sachaContextSigle: 'PR17_2026_PCHD_PVOL'
  },
  {
    subPlanNumber: '444',
    sachaContextSigle: 'PR17_2026_PCHD_PVOL'
  },
  {
    subPlanNumber: '279',
    sachaContextSigle: 'PR17_2026_PCON_PIONI'
  },
  {
    subPlanNumber: '171',
    sachaContextSigle: 'PR17_2026_PCON_PIRU'
  },
  {
    subPlanNumber: '295',
    sachaContextSigle: 'PR17_2026_PCON_PIRU'
  },
  {
    subPlanNumber: '319',
    sachaContextSigle: 'PR17_2026_PCON_PIRU'
  },
  {
    subPlanNumber: '406',
    sachaContextSigle: 'PR17_2026_PCON_PIRU'
  },
  {
    subPlanNumber: '411',
    sachaContextSigle: 'PR17_2026_PCON_PIRU'
  },
  {
    subPlanNumber: '280',
    sachaContextSigle: 'PR17_2026_PCON_POGM'
  },
  {
    subPlanNumber: '330',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '331',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '332',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '509',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '510',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '511',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '512',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '513',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '514',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '515',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '516',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '517',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '518',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '520',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '521',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '522',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '534',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '536',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '537',
    sachaContextSigle: 'PR17_2026_PCON_PRAD'
  },
  {
    subPlanNumber: '070',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '086',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '088',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '089',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '090',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '091',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '093',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '094',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '099',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '100',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '101',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '102',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '103',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '104',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '105',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '118',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '119',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '152',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '153',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '154',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '155',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '156',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '157',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '158',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '159',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '160',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '168',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '169',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '348',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '656',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '733',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '775',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '834',
    sachaContextSigle: 'PR17_2026_PCRC_PBOV'
  },
  {
    subPlanNumber: '087',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '112',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '146',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '147',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '148',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '150',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '650',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '651',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '776',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '828',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '851',
    sachaContextSigle: 'PR17_2026_PCRC_PEQU'
  },
  {
    subPlanNumber: '176',
    sachaContextSigle: 'PR17_2026_PCRC_PGIB'
  },
  {
    subPlanNumber: '179',
    sachaContextSigle: 'PR17_2026_PCRC_PGIB'
  },
  {
    subPlanNumber: '182',
    sachaContextSigle: 'PR17_2026_PCRC_PGIB'
  },
  {
    subPlanNumber: '183',
    sachaContextSigle: 'PR17_2026_PCRC_PGIB'
  },
  {
    subPlanNumber: '184',
    sachaContextSigle: 'PR17_2026_PCRC_PGIB'
  },
  {
    subPlanNumber: '539',
    sachaContextSigle: 'PR17_2026_PCRC_PGIB'
  },
  {
    subPlanNumber: '540',
    sachaContextSigle: 'PR17_2026_PCRC_PGIB'
  },
  {
    subPlanNumber: '193',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '194',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '195',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '196',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '197',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '198',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '202',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '203',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '830',
    sachaContextSigle: 'PR17_2026_PCRC_PLAP'
  },
  {
    subPlanNumber: '302',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '304',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '306',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '310',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '311',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '313',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '314',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '315',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '321',
    sachaContextSigle: 'PR17_2026_PCRC_PLAT'
  },
  {
    subPlanNumber: '083',
    sachaContextSigle: 'PR17_2026_PCRC_PMIE'
  },
  {
    subPlanNumber: '084',
    sachaContextSigle: 'PR17_2026_PCRC_PMIE'
  },
  {
    subPlanNumber: '167',
    sachaContextSigle: 'PR17_2026_PCRC_PMIE'
  },
  {
    subPlanNumber: '832',
    sachaContextSigle: 'PR17_2026_PCRC_PMIE'
  },
  {
    subPlanNumber: '071',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '206',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '207',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '208',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '209',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '210',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '211',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '214',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '215',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '216',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '412',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '413',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '414',
    sachaContextSigle: 'PR17_2026_PCRC_POEU'
  },
  {
    subPlanNumber: '131',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '132',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '133',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '134',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '136',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '137',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '138',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '139',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '140',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '141',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '142',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '732',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '827',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '917',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '919',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '923',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '924',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '925',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '926',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '928',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '930',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '931',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '933',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '939',
    sachaContextSigle: 'PR17_2026_PCRC_POVCA'
  },
  {
    subPlanNumber: '072',
    sachaContextSigle: 'PR17_2026_PCRC_PPEL'
  },
  {
    subPlanNumber: '219',
    sachaContextSigle: 'PR17_2026_PCRC_PPEL'
  },
  {
    subPlanNumber: '220',
    sachaContextSigle: 'PR17_2026_PCRC_PPEL'
  },
  {
    subPlanNumber: '221',
    sachaContextSigle: 'PR17_2026_PCRC_PPEL'
  },
  {
    subPlanNumber: '224',
    sachaContextSigle: 'PR17_2026_PCRC_PPEL'
  },
  {
    subPlanNumber: '225',
    sachaContextSigle: 'PR17_2026_PCRC_PPEL'
  },
  {
    subPlanNumber: '108',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '109',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '110',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '111',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '113',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '114',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '115',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '116',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '120',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '121',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '122',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '123',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '124',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '125',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '127',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '161',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '162',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '163',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '165',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '349',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '655',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '777',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '904',
    sachaContextSigle: 'PR17_2026_PCRC_PPOR'
  },
  {
    subPlanNumber: '233',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '234',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '235',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '236',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '237',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '242',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '243',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '244',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '247',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '248',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '249',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '250',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '251',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '252',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '256',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '259',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '260',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '261',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '262',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '263',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '264',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '268',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '269',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '272',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '273',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '274',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '275',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '276',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '277',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '278',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '281',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '284',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '285',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '286',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '287',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '288',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '289',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '290',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '291',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '292',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '293',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '294',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '296',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '297',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '298',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '299',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '301',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '350',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '829',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '946',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '947',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '948',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '949',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '980',
    sachaContextSigle: 'PR17_2026_PCRC_PVOL'
  },
  {
    subPlanNumber: '569',
    sachaContextSigle: 'PR17_2026_PMIC_LISTPLPA'
  },
  {
    subPlanNumber: '551',
    sachaContextSigle: 'PR17_2026_PMIC_PECVF'
  },
  {
    subPlanNumber: '552',
    sachaContextSigle: 'PR17_2026_PMIC_PECVF'
  },
  {
    subPlanNumber: 'A11',
    sachaContextSigle: 'PR17_2026_PMIC_PSALMPBF'
  },
  {
    subPlanNumber: 'A16',
    sachaContextSigle: 'PR17_2026_PMIC_PSALMPBF'
  },
  {
    subPlanNumber: 'A36',
    sachaContextSigle: 'PR17_2026_PMIC_PSALMPBF'
  },
  {
    subPlanNumber: 'A37',
    sachaContextSigle: 'PR17_2026_PMIC_PSALMPBF'
  },
  {
    subPlanNumber: 'A38',
    sachaContextSigle: 'PR17_2026_PMIC_PSALMPBF'
  },
  {
    subPlanNumber: '556',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMDAOV'
  },
  {
    subPlanNumber: '579',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMDAOV'
  },
  {
    subPlanNumber: '580',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMDAOV'
  },
  {
    subPlanNumber: '581',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMDAOV'
  },
  {
    subPlanNumber: '582',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMDAOV'
  },
  {
    subPlanNumber: '583',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMDAOV'
  },
  {
    subPlanNumber: '584',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMDAOV'
  },
  {
    subPlanNumber: '578',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMPAC'
  },
  {
    subPlanNumber: '577',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMPCC'
  },
  {
    subPlanNumber: '576',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMSAU'
  },
  {
    subPlanNumber: '585',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMSUBST'
  },
  {
    subPlanNumber: '586',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMSUBST'
  },
  {
    subPlanNumber: '820',
    sachaContextSigle: 'PR17_2026_PMIC_PSLMSUBST'
  },
  {
    subPlanNumber: '573',
    sachaContextSigle: 'PR17_2026_PMIC_PSTECPBF'
  },
  {
    subPlanNumber: '574',
    sachaContextSigle: 'PR17_2026_PMIC_PSTECPBF'
  },
  {
    subPlanNumber: '575',
    sachaContextSigle: 'PR17_2026_PMIC_PSTECPBF'
  },
  {
    subPlanNumber: '698',
    sachaContextSigle: 'PR17_2026_PMIC_PSTECPBF'
  },
  {
    subPlanNumber: '699',
    sachaContextSigle: 'PR17_2026_PMIC_PSTECPBF'
  },
  {
    subPlanNumber: '563',
    sachaContextSigle: 'PR17_2026_PMIC_PSTECSALM'
  },
  {
    subPlanNumber: '565',
    sachaContextSigle: 'PR17_2026_PMIC_PSTECSALM'
  },
  {
    subPlanNumber: '570',
    sachaContextSigle: 'PR17_2026_PMIC_PVIRO'
  },
  {
    subPlanNumber: '587',
    sachaContextSigle: 'PR17_2026_PMIC_PVIRO'
  },
  {
    subPlanNumber: '588',
    sachaContextSigle: 'PR17_2026_PMIC_PVIRO'
  },
  {
    subPlanNumber: '553',
    sachaContextSigle: 'PR17_2026_PPEC_PECOLI'
  },
  {
    subPlanNumber: '554',
    sachaContextSigle: 'PR17_2026_PPEC_PHIP'
  },
  {
    subPlanNumber: '847',
    sachaContextSigle: 'PR17_2026_PPEC_PHIP'
  },
  {
    subPlanNumber: '545',
    sachaContextSigle: 'PR17_2026_PPEC_PLIST'
  },
  {
    subPlanNumber: '547',
    sachaContextSigle: 'PR17_2026_PPEC_PLIST'
  },
  {
    subPlanNumber: '566',
    sachaContextSigle: 'PR17_2026_PPEC_PPHYCO'
  },
  {
    subPlanNumber: '862',
    sachaContextSigle: 'PR17_2026_PPEC_PPHYCO'
  },
  {
    subPlanNumber: '849',
    sachaContextSigle: 'PR17_2026_PPEC_PSLM'
  },
  {
    subPlanNumber: '106',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '589',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '590',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '591',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '594',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '599',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '600',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '601',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '602',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '603',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '605',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '748',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '833',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '835',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '875',
    sachaContextSigle: 'PR17_2026_PSRC_PBOV'
  },
  {
    subPlanNumber: '647',
    sachaContextSigle: 'PR17_2026_PSRC_PEQU'
  },
  {
    subPlanNumber: '728',
    sachaContextSigle: 'PR17_2026_PSRC_PEQU'
  },
  {
    subPlanNumber: '850',
    sachaContextSigle: 'PR17_2026_PSRC_PEQU'
  },
  {
    subPlanNumber: '852',
    sachaContextSigle: 'PR17_2026_PSRC_PEQU'
  },
  {
    subPlanNumber: '853',
    sachaContextSigle: 'PR17_2026_PSRC_PEQU'
  },
  {
    subPlanNumber: '997',
    sachaContextSigle: 'PR17_2026_PSRC_PEQU'
  },
  {
    subPlanNumber: '180',
    sachaContextSigle: 'PR17_2026_PSRC_PGIB'
  },
  {
    subPlanNumber: '538',
    sachaContextSigle: 'PR17_2026_PSRC_PGIB'
  },
  {
    subPlanNumber: '676',
    sachaContextSigle: 'PR17_2026_PSRC_PGIB'
  },
  {
    subPlanNumber: '839',
    sachaContextSigle: 'PR17_2026_PSRC_PGIB'
  },
  {
    subPlanNumber: '879',
    sachaContextSigle: 'PR17_2026_PSRC_PGIB'
  },
  {
    subPlanNumber: '204',
    sachaContextSigle: 'PR17_2026_PSRC_PLAP'
  },
  {
    subPlanNumber: '693',
    sachaContextSigle: 'PR17_2026_PSRC_PLAP'
  },
  {
    subPlanNumber: '694',
    sachaContextSigle: 'PR17_2026_PSRC_PLAP'
  },
  {
    subPlanNumber: '695',
    sachaContextSigle: 'PR17_2026_PSRC_PLAP'
  },
  {
    subPlanNumber: '826',
    sachaContextSigle: 'PR17_2026_PSRC_PLAP'
  },
  {
    subPlanNumber: '308',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '309',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '316',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '702',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '704',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '706',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '714',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '910',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '911',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '912',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '913',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '914',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '915',
    sachaContextSigle: 'PR17_2026_PSRC_PLAT'
  },
  {
    subPlanNumber: '081',
    sachaContextSigle: 'PR17_2026_PSRC_PMIE'
  },
  {
    subPlanNumber: '082',
    sachaContextSigle: 'PR17_2026_PSRC_PMIE'
  },
  {
    subPlanNumber: '085',
    sachaContextSigle: 'PR17_2026_PSRC_PMIE'
  },
  {
    subPlanNumber: '213',
    sachaContextSigle: 'PR17_2026_PSRC_POEU'
  },
  {
    subPlanNumber: '709',
    sachaContextSigle: 'PR17_2026_PSRC_POEU'
  },
  {
    subPlanNumber: '711',
    sachaContextSigle: 'PR17_2026_PSRC_POEU'
  },
  {
    subPlanNumber: '895',
    sachaContextSigle: 'PR17_2026_PSRC_POEU'
  },
  {
    subPlanNumber: '898',
    sachaContextSigle: 'PR17_2026_PSRC_POEU'
  },
  {
    subPlanNumber: '143',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '144',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '145',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '324',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '325',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '528',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '531',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '632',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '633',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '638',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '727',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '842',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '916',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '918',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '920',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '932',
    sachaContextSigle: 'PR17_2026_PSRC_POVCA'
  },
  {
    subPlanNumber: '226',
    sachaContextSigle: 'PR17_2026_PSRC_PPEL'
  },
  {
    subPlanNumber: '719',
    sachaContextSigle: 'PR17_2026_PSRC_PPEL'
  },
  {
    subPlanNumber: '724',
    sachaContextSigle: 'PR17_2026_PSRC_PPEL'
  },
  {
    subPlanNumber: '725',
    sachaContextSigle: 'PR17_2026_PSRC_PPEL'
  },
  {
    subPlanNumber: '883',
    sachaContextSigle: 'PR17_2026_PSRC_PPEL'
  },
  {
    subPlanNumber: '126',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '128',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '527',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '609',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '611',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '613',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '621',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '624',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '749',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '855',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '877',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '903',
    sachaContextSigle: 'PR17_2026_PSRC_PPOR'
  },
  {
    subPlanNumber: '245',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '257',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '270',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '282',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '333',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '334',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '342',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '343',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '346',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '347',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '548',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '559',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '560',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '729',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '772',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '773',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '981',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '982',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '983',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '984',
    sachaContextSigle: 'PR17_2026_PSRC_PVOL'
  },
  {
    subPlanNumber: '571',
    sachaContextSigle: 'PR17_2026_RPDA_PMIE'
  },
  {
    subPlanNumber: '391',
    sachaContextSigle: 'PR17_2026_RPDV_PC'
  },
  {
    subPlanNumber: '395',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '399',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '403',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '405',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '407',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '408',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '409',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '410',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '416',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '417',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '418',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '419',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '420',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '421',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '422',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '423',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '424',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '425',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '426',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '427',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '428',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '429',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '461',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '499',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '507',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '561',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '562',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '572',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '649',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '658',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '799',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '863',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '864',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '878',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '882',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '889',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '890',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  },
  {
    subPlanNumber: '937',
    sachaContextSigle: 'PR17_2026_RPDV_PS'
  }
];

const newFieldKeys = fields.map(({ key }) => key);

const placedFieldKeys = [
  ...new Set(
    [...planFields, ...subPlanFields].flatMap((placement) =>
      placement.fields.map(({ fieldKey }) => fieldKey)
    )
  )
];

const placedSubPlanNumbers = [
  ...planFields.map(({ subPlanNumber }) => subPlanNumber),
  ...subPlanFields.flatMap(({ subPlanNumbers }) => subPlanNumbers)
];

const insertedIds = (result: { rows: { id: string }[] }) =>
  result.rows.map(({ id }) => id);

const replaceSubPlanFieldSettings = async (
  knex: Knex,
  from: 'previous' | 'next',
  to: 'previous' | 'next'
) => {
  for (const replacement of subPlanFieldReplacements) {
    const current = replacement[from];
    const target = replacement[to];
    const [subPlanFieldId] = insertedIds(
      await knex.raw(
        `SELECT spf.id
         FROM programming_sub_plan_fields_raw spf
         JOIN programming_sub_plans_raw sp ON sp.id = spf.programming_sub_plan_id
         JOIN programming_plans p ON p.id = sp.programming_plan_id
         JOIN specific_data_fields f ON f.id = spf.field_id
         WHERE p.year = ? AND sp.sub_plan_number = ? AND f.key = ?
           AND spf.inheritance = 'Own' AND spf.required = ?
           AND (
             SELECT array_agg(o.value ORDER BY o.value)
             FROM programming_sub_plan_field_options spfo
             JOIN specific_data_field_options o ON o.id = spfo.specific_data_field_option_id
             WHERE spfo.programming_sub_plan_field_id = spf.id
           ) IS NOT DISTINCT FROM (
             SELECT array_agg(v ORDER BY v) FROM unnest(?::text[]) AS v
           )`,
        [
          year,
          replacement.subPlanNumber,
          replacement.fieldKey,
          current.required,
          current.optionValues
        ]
      )
    );
    if (!subPlanFieldId) {
      continue;
    }

    await knex('programming_sub_plan_fields_raw')
      .where({ id: subPlanFieldId })
      .update({ required: target.required });
    await knex('programming_sub_plan_field_options')
      .where({ programming_sub_plan_field_id: subPlanFieldId })
      .delete();
    await knex.raw(
      `INSERT INTO programming_sub_plan_field_options (programming_sub_plan_field_id, specific_data_field_option_id)
       SELECT ?, o.id FROM specific_data_field_options o
       WHERE o.field_key = ? AND o.value = ANY(?)`,
      [subPlanFieldId, replacement.fieldKey, target.optionValues]
    );
  }
};

export const up = async (knex: Knex) => {
  await knex.raw(
    `UPDATE programming_sub_plans_raw sp
     SET sacha_context_sigle = u.sacha_context_sigle
     FROM programming_plans p, unnest(?::text[], ?::text[]) AS u(sub_plan_number, sacha_context_sigle)
     WHERE p.id = sp.programming_plan_id
       AND p.year = ?
       AND sp.sub_plan_number = u.sub_plan_number
       AND sp.sacha_context_sigle IS NULL`,
    [
      sachaContextSigles.map(({ subPlanNumber }) => subPlanNumber),
      sachaContextSigles.map(({ sachaContextSigle }) => sachaContextSigle),
      year
    ]
  );

  const sachaSigles = new Set(
    (await knex('sacha_commemoratifs').select('sigle')).map(
      ({ sigle }) => sigle
    )
  );
  const sachaValueSigles = new Set(
    (await knex('sacha_commemoratif_values').select('sigle')).map(
      ({ sigle }) => sigle
    )
  );

  if (fields.length > 0) {
    await knex('specific_data_fields')
      .insert(
        fields.map((field) => {
          const hasSachaSigle =
            field.sachaCommemoratifSigle !== null &&
            sachaSigles.has(field.sachaCommemoratifSigle);
          return {
            key: field.key,
            input_type: field.inputType,
            label: field.label,
            hint_text: null,
            sacha_commemoratif_sigle: hasSachaSigle
              ? field.sachaCommemoratifSigle
              : null,
            sacha_in_dai: field.sachaInDai && hasSachaSigle
          };
        })
      )
      .onConflict('key')
      .ignore();
  }

  if (options.length > 0) {
    await knex('specific_data_field_options')
      .insert(
        options.map((option) => ({
          field_key: option.fieldKey,
          value: option.value,
          label: option.label,
          order: option.order,
          sacha_commemoratif_value_sigle:
            option.sachaCommemoratifValueSigle !== null &&
            sachaValueSigles.has(option.sachaCommemoratifValueSigle)
              ? option.sachaCommemoratifValueSigle
              : null
        }))
      )
      .onConflict(['field_key', 'value'])
      .ignore();
  }

  for (const placement of planFields) {
    const plan = await knex.raw(
      `SELECT sp.programming_plan_id AS id
       FROM programming_sub_plans_raw sp
       JOIN programming_plans p ON p.id = sp.programming_plan_id
       WHERE p.year = ? AND sp.sub_plan_number = ?`,
      [year, placement.subPlanNumber]
    );
    const [planId] = insertedIds(plan);
    if (!planId) {
      continue;
    }

    for (const field of placement.fields) {
      const [planFieldId] = insertedIds(
        await knex.raw(
          `INSERT INTO programming_plan_fields (programming_plan_id, field_id, required, "order")
           SELECT ?, f.id, ?, ? FROM specific_data_fields f WHERE f.key = ?
           ON CONFLICT (programming_plan_id, field_id) DO NOTHING
           RETURNING id`,
          [planId, field.required, field.order, field.fieldKey]
        )
      );
      if (!planFieldId) {
        continue;
      }

      await knex.raw(
        `INSERT INTO programming_plan_field_options (programming_plan_field_id, specific_data_field_option_id)
         SELECT ?, o.id FROM specific_data_field_options o
         WHERE o.field_key = ? AND o.value = ANY(?)
         ON CONFLICT DO NOTHING`,
        [planFieldId, field.fieldKey, field.optionValues]
      );

      await knex.raw(
        `INSERT INTO programming_sub_plan_fields_raw (programming_sub_plan_id, field_id, required, "order", inheritance)
         SELECT sp.id, f.id, ?, ?, 'Inherited'
         FROM programming_sub_plans_raw sp
         JOIN specific_data_fields f ON f.key = ?
         WHERE sp.programming_plan_id = ?
         ON CONFLICT (programming_sub_plan_id, field_id) DO NOTHING`,
        [field.required, field.order, field.fieldKey, planId]
      );
    }
  }

  for (const placement of subPlanFields) {
    for (const field of placement.fields) {
      const subPlanFieldIds = insertedIds(
        await knex.raw(
          `INSERT INTO programming_sub_plan_fields_raw (programming_sub_plan_id, field_id, required, "order", inheritance)
           SELECT sp.id, f.id, ?,
             COALESCE((SELECT max(x."order") FROM programming_sub_plan_fields_raw x WHERE x.programming_sub_plan_id = sp.id), 0) + 1,
             'Own'
           FROM programming_sub_plans_raw sp
           JOIN programming_plans p ON p.id = sp.programming_plan_id
           JOIN specific_data_fields f ON f.key = ?
           WHERE p.year = ? AND sp.sub_plan_number = ANY(?)
           ON CONFLICT (programming_sub_plan_id, field_id) DO NOTHING
           RETURNING id`,
          [field.required, field.fieldKey, year, placement.subPlanNumbers]
        )
      );
      if (subPlanFieldIds.length === 0 || field.optionValues.length === 0) {
        continue;
      }

      await knex.raw(
        `INSERT INTO programming_sub_plan_field_options (programming_sub_plan_field_id, specific_data_field_option_id)
         SELECT spf.id, o.id
         FROM unnest(?::uuid[]) AS spf(id)
         CROSS JOIN specific_data_field_options o
         WHERE o.field_key = ? AND o.value = ANY(?)
         ON CONFLICT DO NOTHING`,
        [subPlanFieldIds, field.fieldKey, field.optionValues]
      );
    }
  }

  await replaceSubPlanFieldSettings(knex, 'previous', 'next');
};

export const down = async (knex: Knex) => {
  await knex.raw(
    `UPDATE programming_sub_plans_raw sp
     SET sacha_context_sigle = NULL
     FROM programming_plans p, unnest(?::text[], ?::text[]) AS u(sub_plan_number, sacha_context_sigle)
     WHERE p.id = sp.programming_plan_id
       AND p.year = ?
       AND sp.sub_plan_number = u.sub_plan_number
       AND sp.sacha_context_sigle = u.sacha_context_sigle`,
    [
      sachaContextSigles.map(({ subPlanNumber }) => subPlanNumber),
      sachaContextSigles.map(({ sachaContextSigle }) => sachaContextSigle),
      year
    ]
  );

  await replaceSubPlanFieldSettings(knex, 'next', 'previous');

  const placedPlanIds = knex('programming_sub_plans_raw as sp')
    .join('programming_plans as p', 'p.id', 'sp.programming_plan_id')
    .where('p.year', year)
    .whereIn('sp.sub_plan_number', placedSubPlanNumbers)
    .select('sp.programming_plan_id');
  const placedFieldIds = knex('specific_data_fields')
    .whereIn('key', placedFieldKeys)
    .select('id');

  await knex('programming_sub_plan_fields_raw')
    .whereIn('field_id', placedFieldIds)
    .whereIn(
      'programming_sub_plan_id',
      knex('programming_sub_plans_raw')
        .whereIn('programming_plan_id', placedPlanIds)
        .select('id')
    )
    .delete();

  await knex('programming_plan_fields')
    .whereIn('field_id', placedFieldIds)
    .whereIn('programming_plan_id', placedPlanIds)
    .delete();

  await knex('specific_data_fields').whereIn('key', newFieldKeys).delete();

  for (const option of options.filter(
    ({ fieldKey }) => !newFieldKeys.includes(fieldKey)
  )) {
    await knex('specific_data_field_options')
      .where({ field_key: option.fieldKey, value: option.value })
      .delete();
  }
};
