import { z } from 'zod';

export const DocumentKind = z.enum(['OverviewDocument', 'SupportDocument']);

export type DocumentKind = z.infer<typeof DocumentKind>;
