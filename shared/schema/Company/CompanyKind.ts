import { z } from 'zod';

export const CompanyKind = z.enum([
  'POULTRY_SLAUGHTERHOUSE',
  'MEAT_SLAUGHTERHOUSE'
]);

export type CompanyKind = z.infer<typeof CompanyKind>;
