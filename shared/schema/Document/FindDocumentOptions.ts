import { z } from 'zod';
import { DocumentKind } from './DocumentKind';

export const FindDocumentOptions = z.object({
  kinds: z.array(DocumentKind).nullish(),
  sampleId: z.guid().nullish(),
  programmingPlanIds: z.array(z.guid()).nullish(),
  includeNoProgrammingPlan: z.boolean().nullish(),
  year: z.number().int().nullish()
});

export type FindDocumentOptions = z.infer<typeof FindDocumentOptions>;
