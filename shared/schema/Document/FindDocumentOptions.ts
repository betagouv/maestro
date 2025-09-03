import { z } from 'zod';
import { DocumentKind } from './DocumentKind';
export const FindDocumentOptions = z.object({
  kind: DocumentKind.nullish(),
  sampleId: z.guid().nullish()
});

export type FindDocumentOptions = z.infer<typeof FindDocumentOptions>;
