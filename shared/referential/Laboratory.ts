import { z } from 'zod';

const laboratoryShortNames = [
  'ANS 94a - LNR ETM',
  'ANS 94a - LNR PEST',
  'CAP 29',
  'CER 30',
  'GIR 49',
  'LDA 17',
  'LDA 21',
  'LDA 22',
  'LDA 31',
  'LDA 66',
  'LDA 72',
  'LDA 85',
  'LDA 87',
  'SCL 34',
  'SCL 91'
] as const satisfies string[];
export const laboratoryShortNameValidator = z.enum(laboratoryShortNames);
export type LaboratoryShortName = z.infer<typeof laboratoryShortNameValidator>;

export const LaboratoryWithAutomation = [
  'GIR 49',
  'LDA 72',
  'CAP 29',
  'CER 30'
] as const satisfies LaboratoryShortName[];
