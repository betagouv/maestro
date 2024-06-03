import { z } from 'zod';

export const DocumentKind = z.enum(['OverviewDocument', 'SampleItemDocument']);

export type DocumentKind = z.infer<typeof DocumentKind>;
