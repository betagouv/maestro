import { z } from 'zod';

export const Domain = z.enum(['PPV', 'PFAS']);

export type Domain = z.infer<typeof Domain>;

export const DomainList: Domain[] = Domain.options;
