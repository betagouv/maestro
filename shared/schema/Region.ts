import { z } from 'zod';

export const Region = z.enum(
  [
    'ARA',
    'BFC',
    'BRE',
    'CVL',
    'COR',
    'GES',
    'HDF',
    'IDF',
    'NOR',
    'NAQ',
    'OCC',
    'PDL',
    'PAC',
    'GUA',
    'MAR',
    'GUY',
    'REU',
    'MYT',
  ],
  {
    errorMap: () => ({ message: 'Veuillez renseigner la région' }),
  }
);

export type Region = z.infer<typeof Region>;

export const RegionList: Region[] = [
  'ARA',
  'BFC',
  'BRE',
  'CVL',
  'COR',
  'GES',
  'HDF',
  'IDF',
  'NOR',
  'NAQ',
  'OCC',
  'PDL',
  'PAC',
  'GUA',
  'MAR',
  'GUY',
  'REU',
  'MYT',
];

export const RegionLabels: Record<Region, string> = {
  ARA: 'Auvergne-Rhône-Alpes',
  BFC: 'Bourgogne-Franche-Comté',
  BRE: 'Bretagne',
  CVL: 'Centre-Val de Loire',
  COR: 'Corse',
  GES: 'Grand Est',
  HDF: 'Hauts-de-France',
  IDF: 'Île-de-France',
  NOR: 'Normandie',
  NAQ: 'Nouvelle-Aquitaine',
  OCC: 'Occitanie',
  PDL: 'Pays de la Loire',
  PAC: "Provence-Alpes-Côte d'Azur",
  GUA: 'Guadeloupe',
  MAR: 'Martinique',
  GUY: 'Guyane',
  REU: 'La Réunion',
  MYT: 'Mayotte',
};
