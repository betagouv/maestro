import { z } from 'zod';

export const CompanyKind = z.enum(['Slaughterhouse']);

export type CompanyKind = z.infer<typeof CompanyKind>;
