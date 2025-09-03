import { z } from 'zod';

const laboratoryNames = [
  'SCL 34',
  'LDA 66',
  'LDA 72',
  'SCL 91',
  'GIR 49',
  'CAP 29',
  'CER 30'
] as const satisfies string[];
export const laboratoryNameValidator = z.enum(laboratoryNames);
export type LaboratoryName = z.infer<typeof laboratoryNameValidator>;

export const LaboratoryWithAutomation = [
  'GIR 49',
  'LDA 72',
  'CAP 29',
  'CER 30'
] as const satisfies LaboratoryName[];

const laboratoryLabel = {
  'CAP 29': 'Capinov',
  'CER 30': 'CERECO',
  'GIR 49': 'GIRPA',
  'LDA 66': 'CAMP',
  'LDA 72': 'Inovalys',
  'SCL 34': 'SCL Montpellier',
  'SCL 91': "SCL d'Ile de France"
} as const satisfies Record<LaboratoryName, string>;

export const getLaboratoryFullname = (name: LaboratoryName): string =>
  `${name} - ${laboratoryLabel[name]}`;
