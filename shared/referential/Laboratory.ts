import { z } from 'zod';

const laboratoryShortNames = [
  'SCL 34',
  'LDA 66',
  'LDA 72',
  'SCL 91',
  'GIR 49',
  'CAP 29',
  'CER 30'
] as const satisfies string[];
export const laboratoryShortNameValidator = z.enum(laboratoryShortNames);
export type LaboratoryShortName = z.infer<typeof laboratoryShortNameValidator>;

export const LaboratoryWithAutomation = [
  'GIR 49',
  'LDA 72',
  'CAP 29',
  'CER 30'
] as const satisfies LaboratoryShortName[];
