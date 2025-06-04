import { z } from 'zod/v4';
import { DocumentKind } from './DocumentKind';
export const FindDocumentOptions = z.object({
  kind: DocumentKind.nullish(),
  sampleId: z.guid().nullish()
});

export type FindDocumentOptions = z.infer<typeof FindDocumentOptions>;
