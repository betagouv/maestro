import { z } from 'zod';

export const laboratoryNames = [
  'SCL 34',
  'LDA 66',
  'LDA 72',
  'SCL 91',
  'GIR 49',
  'CAP 29',
  'CER 30',
  'FYT'
] as const satisfies string[];
export const laboratoryNameValidator = z.enum(laboratoryNames);
export type LaboratoryName = z.infer<typeof laboratoryNameValidator>;

export const LaboratoryWithAutomation = [
  'GIR 49',
  'LDA 72',
  'CAP 29'
] as const satisfies LaboratoryName[];
