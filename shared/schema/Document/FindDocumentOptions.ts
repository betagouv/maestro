import { z } from 'zod';
import { DocumentKind } from './DocumentKind';
export const FindDocumentOptions = z.object({
  kind: DocumentKind.optional().nullable(),
});

export type FindDocumentOptions = z.infer<typeof FindDocumentOptions>;
